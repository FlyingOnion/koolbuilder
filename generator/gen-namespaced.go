package generator

func (c Controller) namespacedListerFields() []string {
	fields := make([]string, 0, len(c.Resources))
	for i := range c.Resources {
		fields = append(fields, c.Resources[i].LowerKind+"Lister kool.NamespacedLister["+c.Resources[i].GoType+"]")
	}
	return fields
}

func (c Controller) namespacedInformerInits() []string {
	expressions := make([]string, 0, len(c.Resources))
	for i := range c.Resources {
		expressions = append(expressions, c.Resources[i].LowerKind+`Informer := kool.NewNamespacedInformer[`+c.Resources[i].GoType+`](client, "`+c.Namespace+`", 30*time.Second)`)
	}
	return expressions
}

func (c Controller) namespacedNewControllerArgs() []string {
	expressions := make([]string, 0, len(c.Resources))
	for i := range c.Resources {
		expressions = append(expressions, c.Resources[i].LowerKind+`Informer kool.NamespacedInformer[`+c.Resources[i].GoType+`],`)
	}
	return expressions
}
