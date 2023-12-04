module github.com/FlyingOnion/koolbuilder

go 1.21.1

replace github.com/FlyingOnion/pkg => ../pkg

require (
	github.com/FlyingOnion/pkg v0.0.0-00010101000000-000000000000
	github.com/Masterminds/sprig/v3 v3.2.3
	github.com/spf13/pflag v1.0.5
	gopkg.in/yaml.v3 v3.0.1
	k8s.io/apimachinery v0.28.4
)

require (
	github.com/Masterminds/goutils v1.1.1 // indirect
	github.com/Masterminds/semver/v3 v3.2.0 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/huandu/xstrings v1.3.3 // indirect
	github.com/imdario/mergo v0.3.11 // indirect
	github.com/mitchellh/copystructure v1.0.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.0 // indirect
	github.com/shopspring/decimal v1.2.0 // indirect
	github.com/spf13/cast v1.3.1 // indirect
	github.com/stretchr/testify v1.8.4 // indirect
	golang.org/x/crypto v0.3.0 // indirect
)
