package main

import (
	_ "embed"
	"text/template"

	"github.com/Masterminds/sprig/v3"
)

//go:embed tmpl/gomod.tmpl
var tmplContentGoMod string

//go:embed tmpl/main.go.tmpl
var tmplContentMain string

//go:embed tmpl/event_handler.go.tmpl
var tmplContentEventHandler string

//go:embed tmpl/controller.go.tmpl
var tmplContentController string

//go:embed tmpl/deepcopy.go.tmpl
var tmplContentDeepCopy string

var (
	tmplBase         = template.New("base").Funcs(sprig.FuncMap())
	tmplGoMod        = template.Must(tmplBase.New("gomod").Parse(tmplContentGoMod))
	tmplMain         = template.Must(tmplBase.New("main").Parse(tmplContentMain))
	tmplEventHandler = template.Must(tmplBase.New("event_handler").Parse(tmplContentEventHandler))
	tmplController   = template.Must(tmplBase.New("controller").Parse(tmplContentController))
	tmplDeepCopy     = template.Must(tmplBase.New("deepcopy").Parse(tmplContentDeepCopy))
)
