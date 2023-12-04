package main

import (
	"os"

	"github.com/FlyingOnion/koolbuilder/generator"
	"github.com/FlyingOnion/pkg/log"
	"github.com/spf13/pflag"
)

func mustGetOrFatal[T any](t T, err error) T {
	if err != nil {
		os.Exit(1)
	}
	return t
}

func mustHaveNoError(err error) {
	if err != nil {
		os.Exit(1)
	}
}

func main() {
	var configFile string
	pflag.StringVarP(&configFile, "filename", "f", "", "configuration file of the operator")
	pflag.Parse()

	if len(configFile) == 0 {
		log.Error("missing configuration file")
		log.Info("usage: koolbuilder -f config.yaml")
		pflag.PrintDefaults()
		os.Exit(1)
	}

	config := mustGetOrFatal(generator.ReadConfig(configFile))
	mustHaveNoError(config.InitAndValidate())
	mustHaveNoError(generator.CreateOrRewriteGoMod(tmplGoMod, config))
	mustHaveNoError(generator.CreateOrRewrite(tmplMain, config))
	mustHaveNoError(generator.CreateOrRewrite(tmplController, config))
	mustHaveNoError(generator.CreateOrUpdateCustom(tmplCustom, config))
	mustHaveNoError(generator.CreateOrRewriteDeepCopy(tmplDeepCopy, config))
	mustHaveNoError(generator.RunGoModTidy(config))
	log.Info("all done")
}
