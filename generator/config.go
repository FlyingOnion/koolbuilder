package generator

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/FlyingOnion/pkg/log"
	"k8s.io/apimachinery/pkg/util/sets"
)

type Controller struct {
	Base string `yaml:"base"`
	Name string `yaml:"name"`

	Go GoConfig `yaml:"go"`

	// Enqueue   string     `yaml:"enqueue"`
	Retry     int        `yaml:"retry"`
	Namespace string     `yaml:"namespace"`
	Resources []Resource `yaml:"resources"`

	// template: controller
	//  type Controller struct {
	//      xxxLister kool.Lister           // global
	//      xxxLister kool.NamespacedLister // namespaced
	//  }
	ListerFields []string `yaml:"-"`

	// template: controller
	//  type Controller struct {
	//      xxxHasSynced cache.InformerSynced // common
	//  }
	HasSyncedFields []string `yaml:"-"`

	// template: controller
	//  c.xxxLister := xxxInformer.Lister()             // common
	//  c.xxxSynced := xxxInformer.Informer().HasSynced // common
	StructFieldInits []string `yaml:"-"`

	// template: main
	//  xxxInformer := kool.NewInformer           // global
	//  xxxInformer := kool.NewNamespacedInformer // namespaced
	InformerInits []string `yaml:"-"`

	// template: main
	//  go c.xxxInformer.Informer().Run(ctx.Done())
	InformerRuns []string `yaml:"-"`

	// template: controller
	//  func NewController(
	//      xxxInformer kool.Informer,           // global
	//      xxxInformer kool.NamespacedInformer, // namespaced
	//  )
	NewControllerArgs []string `yaml:"-"`

	Imports []string `yaml:"-"`
}

type GoConfig struct {
	Module        string
	Version       string
	K8sAPIVersion string `yaml:"k8sAPIVersion"`
}

type Template int8

const (
	TemplateNone Template = iota
	TemplateDefinition
	TemplateDeepCopy
	TemplateBoth
)

type Resource struct {
	Group   string
	Version string
	Kind    string

	Package string
	// Alias   string

	Template     Template
	IsCustom     bool
	IsNamespaced bool

	LowerKind string `yaml:"-"`
	GoType    string `yaml:"-"`
}

type Import struct {
	Alias string
	Pkg   string
}

type ImportList []Import

func (i ImportList) Len() int           { return len(i) }
func (l ImportList) Swap(i, j int)      { l[i], l[j] = l[j], l[i] }
func (l ImportList) Less(i, j int) bool { return l[i].Pkg < l[j].Pkg }

const (
	msgConfigInvalid             = `config is invalid`
	msgInvalidRetry              = `retryOnError must be between 0 and 10`
	msgNoResources               = `no resource to control`
	msgUnknownResourceKind       = `unknown resource kind`
	msgUnknownResourceKindTip    = `if you need to control a builtin resource, set package to k8s.io/api/<package-group>/<version> and try again`
	msgNoVersionInPackage        = `no version information in package`
	msgUseDefaultVersionV1       = `use default version "v1" as resource version`
	msgIncompatibility           = `this may cause incompatibility`
	msgInconsistentVersion       = `version information in package is inconsistent with resource version`
	msgInvalidThirdPartyGroup    = `invalid third-party group name; group name cannot be any of ` + k8sBuiltinGroupsString + ` or ends with ".k8s.io" because they are k8s builtin groups`
	msgInvalidThirdPartyGroupTip = `if you need a builtin resource, leave group empty, set package to k8s.io/api/<package-group>/<version> and try again`
	msgNoNeedToGenDeepCopy       = `no need to generate DeepCopy`
	msgShouldNotGenDeepCopy      = `should not generate DeepCopy`
)

const (
	defaultName          = "Controller"
	defaultGoVersion     = "1.21.4"
	defaultK8sAPIVersion = "0.28.4"
)

func defaultController() *Controller {
	return &Controller{
		Base: ".",
		Name: defaultName,
		Go: GoConfig{
			Module:        "controller",
			Version:       defaultGoVersion,
			K8sAPIVersion: defaultK8sAPIVersion,
		},
		Retry: 3,
	}
}

func (c *Controller) InitAndValidate() error {
	if len(c.Base) == 0 {
		c.Base = "."
	}
	c.Base = filepath.Clean(c.Base)
	// mkdir if needed
	log.Info("checking directory", "directory", c.Base)
	if _, err := os.Stat(c.Base); os.IsNotExist(err) {
		err := os.MkdirAll(c.Base, os.ModePerm)
		if err != nil {
			log.Error("failed to create directory", "directory", c.Base, "cause", err)
			return err
		}
	}
	if len(c.Name) == 0 {
		c.Name = defaultName
	}
	if len(c.Go.Module) == 0 {
		c.Go.Module = strings.ToLower(c.Name)
	}
	if len(c.Go.Version) == 0 {
		c.Go.Version = defaultGoVersion
	}
	if len(c.Go.K8sAPIVersion) == 0 {
		c.Go.K8sAPIVersion = defaultK8sAPIVersion
	}
	if c.Retry < 0 || c.Retry > 10 {
		log.Error(msgConfigInvalid, "cause", msgInvalidRetry)
		return errors.New(msgConfigInvalid)
	}
	// initializations below uses len(c.Resources)
	// so we need to ensure that it is not 0
	if len(c.Resources) == 0 {
		log.Error(msgConfigInvalid, "cause", msgNoResources)
		return errors.New(msgConfigInvalid)
	}

	// imports is used to deal with extra imports
	// it collects all unique imports and generates Controller.Imports
	imports := sets.Set[string]{}

	c.ListerFields = make([]string, 0, len(c.Resources))
	c.HasSyncedFields = make([]string, 0, len(c.Resources))
	c.StructFieldInits = make([]string, 0, 2*len(c.Resources))
	c.InformerInits = make([]string, 0, len(c.Resources))
	c.InformerRuns = make([]string, 0, len(c.Resources))
	c.NewControllerArgs = make([]string, 0, len(c.Resources))

	for i := range c.Resources {
		if len(c.Resources[i].LowerKind) == 0 || c.Resources[i].LowerKind == "UnknownType" {
			return errors.New(msgUnknownResourceKind)
		}
		// field initializations
		c.Resources[i].LowerKind = strings.ToLower(c.Resources[i].Kind)
		if c.Resources[i].IsCustom {
			initGVPBuiltin(&(c.Resources[i]))
		} else {
			initGVPLocalAndThirdParty(&(c.Resources[i]))
		}

		// init go type and add import
		if len(c.Resources[i].Group) > 0 && (len(c.Resources[i].Package) == 0 || c.Resources[i].Package == c.Go.Module) {
			c.Resources[i].GoType = c.Resources[i].Kind
		} else {
			alias := getAlias(c.Resources[i].Package)
			c.Resources[i].GoType = alias + "." + c.Resources[i].Kind
			imports.Insert(alias + ` "` + c.Resources[i].Package + `"`)
		}
		// init ns-based fields
		if len(c.Namespace) > 0 && c.Resources[i].IsNamespaced {
			c.ListerFields = append(c.ListerFields, c.Resources[i].LowerKind+"Lister kool.NamespacedLister["+c.Resources[i].GoType+"]")
			c.InformerInits = append(c.InformerInits, c.Resources[i].LowerKind+`Informer := kool.NewNamespacedInformer[`+c.Resources[i].GoType+`](client, "`+c.Namespace+`", 30*time.Second)`)
			c.NewControllerArgs = append(c.NewControllerArgs, c.Resources[i].LowerKind+`Informer kool.NamespacedInformer[`+c.Resources[i].GoType+`],`)
		} else {
			c.ListerFields = append(c.ListerFields, c.Resources[i].LowerKind+"Lister kool.Lister["+c.Resources[i].GoType+"]")
			c.InformerInits = append(c.InformerInits, c.Resources[i].LowerKind+`Informer := kool.NewInformer[`+c.Resources[i].GoType+`](client, 30*time.Second)`)
			c.NewControllerArgs = append(c.NewControllerArgs, c.Resources[i].LowerKind+`Informer kool.Informer[`+c.Resources[i].GoType+`],`)
		}
		// init ns-independent fields
		c.HasSyncedFields = append(c.HasSyncedFields, c.Resources[i].LowerKind+"Synced cache.InformerSynced")
		c.StructFieldInits = append(c.StructFieldInits,
			"c."+c.Resources[i].LowerKind+"Lister = "+c.Resources[i].LowerKind+"Informer.Lister()",
			"c."+c.Resources[i].LowerKind+"Synced = "+c.Resources[i].LowerKind+"Informer.Informer().HasSynced",
		)
		c.InformerRuns = append(c.InformerRuns, "go c."+c.Resources[i].LowerKind+"Informer.Informer().Run(ctx.Done())")
	}
	importList := imports.UnsortedList()
	sort.Strings(importList)
	c.Imports = importList
	return nil
}

func getVersionFromPackage(pkg string) (string, bool) {
	for _, str := range strings.Split(pkg, "/") {
		if versionRegex.MatchString(str) {
			return str, true
		}
	}
	return "v1", false
}

func initGVPLocalAndThirdParty(r *Resource) {
	if isK8sBuiltinGroup(r.Group) {
		log.Fatal(msgConfigInvalid,
			"cause", msgInvalidThirdPartyGroup,
			"group", r.Group,
			"tip", msgInvalidThirdPartyGroupTip,
		)
	}
	emptyVersion := len(r.Version) == 0
	version, found := getVersionFromPackage(r.Package)
	switch {
	case emptyVersion && !found:
		log.Warn(msgNoVersionInPackage, "package", r.Package)
		log.Warn(msgIncompatibility)
		r.Version = version
	case !emptyVersion && found && version != r.Version:
		log.Warn(msgInconsistentVersion, "package version", version, "resource version", r.Version)
		log.Warn(msgIncompatibility)
	}
}

func initGVPBuiltin(r *Resource) {
	pkgGroup, ok := kind2Group(r.Kind)
	if !ok && len(r.Package) == 0 {
		log.Fatal(
			msgConfigInvalid,
			"cause", msgUnknownResourceKind,
			"kind", r.Kind,
			"tip", msgUnknownResourceKindTip,
		)
	}

	emptyVersion, emptyPackage := len(r.Version) == 0, len(r.Package) == 0
	switch {
	case emptyVersion && emptyPackage:
		r.Version = "v1"
		r.Package = "k8s.io/api/" + pkgGroup + "/v1"
	case emptyPackage:
		r.Package = "k8s.io/api/" + pkgGroup + "/" + r.Version
	case emptyVersion:
		version, found := getVersionFromPackage(r.Package)
		if !found {
			log.Warn(msgNoVersionInPackage, "package", r.Package)
			log.Warn(msgIncompatibility)
		}
		r.Version = version
	default:
		version, found := getVersionFromPackage(r.Package)
		if found && version != r.Version {
			log.Warn(msgInconsistentVersion, "kind", r.Kind, "package version", version, "resource version", r.Version)
			log.Warn(msgIncompatibility)
		}
	}
}
