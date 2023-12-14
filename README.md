# Koolbuilder

Build your kubernetes operator easily

## Getting Started

Choose one of the following:

Cloudflare Pages (China-mainland-friendly)

https://koolbuilder.pages.dev

GitHub Pages

https://flyingonion.github.io/koolbuilder/index.html

## Concepts

### Controller Name

Controller name is the name of the controller. It also decides go module name if you choose not to customize it.

Select `controller.go` and see the controller structure name.

### Go Module Name

Go module name is the name of the go module. By default, it is the lowercase of controller name, but you can customize it.

Select `go.mod` file and try changing the module name.

### Go Version

Go version is the version of the Go compiler.

See the `go 1.21.4` line in `go.mod` file.

### Kubernetes API Version

Kubernetes API version is the version of the Kubernetes API.

See dependencies in `go.mod` file.

### Namespace

Namespace sets limits on resources.

Set to empty string to use all namespaces.

If set, then for each resource whose scope is namespaced, the controller will only manage resources in the specified namespace.

### Retry

Retry is the number of times to retry when controller failed to add a main resource to workqueue.

### Main Resource

Main resource is the resource that the controller controls. Each resource should be added to workqueue when syncing.

### Other Resources 1~n (optional)

Other resources are the resources that the controller requires when managing the main resource. Controller can get their information by resource listers.

For example, official deployment controller takes `Deployment` as main resource. Meanwhile, it requires `Replicaset` and `Pod` as other resources. In this case, the yaml configuration should be like this:

```yaml
resources:
- kind: Deployment # main resource
- kind: ReplicaSet
- kind: Pod
```

## FAQ

### The generated code could not compile.

To ensure user friendliness, we do not adopt strict validation on the form. Even invalid inputs can generate code.

If you encounter an error, please check following issues first:

- Check if there's any `undefined` or `UnknownType` in the code. You should have forgot to fill the resource `Group`, `Version` or `Kind`.
- Check if you have same `Kind` in different resources. By default, `Kind` should be unique.
- Check if each custom resource has a definition struct and has already implemented this method:

  `DeepCopyObject() runtime.Object`

If you have any issues, please don't hesitate to let us know.

### What's the difference between official and custom resource?

**Official resources** are like `Deployment`, `Pod`, `Service`, `ConfigMap`, `Job`, etc. They have a predefined group like `""`(aka `core`), `apps`, `batch`, etc.

They don't need to be added to scheme manually. When you import scheme package, they will be registered automatically.

Neither do they need to generate `DeepCopyObject` method. They are already a `runtime.Object`.

**Custom resources** are defined by user.

They need to be added to scheme manually.

Some third-party resources have already implement `DeepCopyObject` method using official deepcopy-gen, so they don't need to regenerate `DeepCopyObject` method. Otherwise, you should click `GenDeepCopy` or implement it on your own, or the generated code will panic when launching.

### My Kubernetes version is old, is it still supported?

Yes. Some official resources do have different versions like `Job` and `CronJob` (`batch/v1` and `batch/v1beta1`). You can choose the correct version based on your Kubernetes version.

The Kubernetes api version does not have great influence. If `Group` and `Version` both match, the operator will work.

### Will the server record any information?

No. All the functions (including download) are implemented by front-end code.

### How do I update the generated code?

Please use the command line tool.

**(Currently it is out-of-date. We are working on it to match the latest frontend.)**

```bash
go install github.com/FlyingOnion/koolbuilder@latest

cd <your-project>
koolbuilder -f controller.yaml
```

Files that will be overwritten:
- `main.go`
- `controller.go`

Files that will be updated:
- `custom.go`

### Why use mapstructure to implement deepcopy?

Well, it's not a big deal. You can use deepcopy-gen too.

~~(It's because we don't have much time reading and understanding deepcopy-gen and write a generator like that.)~~

## License

The project is licensed under the MIT license.

## Thanks

This project won't proceed without [zhaohuabing](https://github.com/zhaohuabing)'s help. His tutorial introducing kubernetes controller are brief and clear.

[Kubernetes Controller 机制详解（一）](
https://mp.weixin.qq.com/s?__biz=MzU3MjI5ODgxMA==&mid=2247484264&idx=1&sn=3a49472acb95aa4efd7b4b89f90640f0)

[Kubernetes Controller 机制详解（二）](
https://mp.weixin.qq.com/s?__biz=MzI5ODk5ODI4Nw==&mid=2247532347&idx=4&sn=4275b81f9547fb21c65f96572d25aeb8)

Tutorial Repo: https://github.com/zhaohuabing/k8scontrollertutorial

Besides, with a lot of useful frontend libraries, I saved a lot of time writing my pages. They are:

[Vue](https://github.com/vuejs/vue)
[Vite](https://github.com/vitejs/vite)
[Unocss](https://github.com/unocss/unocss)
[FileSaver](https://github.com/eligrey/FileSaver.js)
[JSZip](https://github.com/Stuk/jszip)
[Codemirror-editor-vue3](https://github.com/rennzhang/codemirror-editor-vue3)

## Future Features

- [ ] Update go command line tool
- [ ] Add `kool-controller.yaml` to support command line tool
- [ ] Add `Generate Definition Struct` option
- [ ] Add `Generate DeepCopyObject` option
- [ ] Add the rest of the official resources (currently we just add some resources in `core`, `apps`, and `batch` group)
- [ ] Support custom sync period (currently all resources are 30s)
- [ ] Add `Dockerfile`, `Makefile`, k8s yaml config files
- [ ] Add `Load Example`