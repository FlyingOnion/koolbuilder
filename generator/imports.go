package generator

import (
	"regexp"
	"slices"
	"strings"
)

var versionRegex = regexp.MustCompile(`^v\d+((alpha|beta|rc)\d+)?$`)

const (
	apps        = "apps"
	autoscaling = "autoscaling"
	batch       = "batch"
	core        = "core"
	discovery   = "discovery"
	networking  = "networking"
	policy      = "policy"
	rbac        = "rbac"
	scheduling  = "scheduling"
	storage     = "storage"
)

var kindGroupMap = map[string]string{
	"Deployment":  apps,
	"StatefulSet": apps,
	"ReplicaSet":  apps,
	"DaemonSet":   apps,

	"HorizontalPodAutoscaler": autoscaling,

	"Job":     batch,
	"CronJob": batch,

	"Binding":               core,
	"Pod":                   core,
	"PodTemplate":           core,
	"Endpoints":             core,
	"ReplicationController": core,
	"Node":                  core,
	"Namespace":             core,
	"Service":               core,
	"ServiceAccount":        core,
	"ConfigMap":             core,
	"Secret":                core,
	"LimitRange":            core,
	"ResourceQuota":         core,
	"PersistentVolume":      core,
	"PersistentVolumeClaim": core,

	"EndpointSlice": discovery,

	"Ingress":       networking,
	"IngressClass":  networking,
	"NetworkPolicy": networking,

	"Role":               rbac,
	"RoleBinding":        rbac,
	"ClusterRole":        rbac,
	"ClusterRoleBinding": rbac,

	"PriorityClass": scheduling,

	"CSIDriver":          storage,
	"CSINodes":           storage,
	"CSIStorageCapacity": storage,
	"StorageClass":       storage,
}

func kind2Group(kind string) (group string, ok bool) {
	group, ok = kindGroupMap[kind]
	return
}

var schemaGroupMap = map[string]string{
	"core":       "",
	"discovery":  "discovery.k8s.io",
	"networking": "networking.k8s.io",
	"rbac":       "rbac.authorization.k8s.io",
	"scheduling": "scheduling.k8s.io",
	"storage":    "storage.k8s.io",
}

func schemaGroup(group string) string {
	if g, ok := schemaGroupMap[group]; ok {
		return g
	}
	return group
}

var k8sBuiltinGroups = []string{apps, autoscaling, batch, core, discovery, networking, policy, rbac, scheduling, storage, "v1"}

const k8sBuiltinGroupsString = "apps, autoscaling, batch, core, discovery, networking, policy, rbac, scheduling, storage, v1"

func isK8sBuiltinGroup(group string) bool {
	return slices.Contains(k8sBuiltinGroups, group) || strings.HasSuffix(group, ".k8s.io")
}

func getAlias(pkg string) string {
	s := strings.Split(pkg, "/")
	switch len(s) {
	case 1:
		return pkg
	case 2:
		return s[1]
	}
	if versionRegex.MatchString(s[len(s)-1]) {
		return s[len(s)-2] + s[len(s)-1]
	}
	return s[len(s)-1]
}
