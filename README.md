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

Main resource is the resource that the controller controls. When a new event (add/update/delete) comes, the corresponding resource should be added to workqueue and got synced.

### Other Resources 1~n (optional)

Other resources are the resources that the controller requires when managing the main resource. Controller can get their information by resource listers.

For example, official deployment controller takes `Deployment` as main resource. Meanwhile, it requires to monitor `ReplicaSet` and `Pod` too. In this case, the yaml configuration should be like this:

```yaml
resources:
- kind: Deployment # main resource
- kind: ReplicaSet
- kind: Pod
```

To see the code, click `Load Example` and choose `Custom Deployment Controller`.

## FAQ

### The generated code could not compile.

To ensure user friendliness, we do not adopt strict validation on the form. Even invalid inputs can generate code.

If you encounter an error, please check following issues:

- Check if there's any `undefined` or `UnknownType` in the code. If so, there may be wrong filling of `Group`, `Version` or `Kind` field.
- Check if you have same `Kind` in different resources. `Kind` should be unique.
- Check if each custom resource has a definition struct and has already implemented this method:

  `DeepCopyObject() runtime.Object`

  Each resource must be a `runtime.Object`, or the controller program will panic.

If you have any other issues, please don't hesitate to let us know.

### What's the difference between official and custom resource?

Official resources are like `Deployment`, `Pod`, `Service`, `ConfigMap`, `Job`, etc. They have a predefined group like `""`(aka `core`), `apps`, `batch`, etc.

Custom resources are defined by third-party user.

### How do I choose "Generate Resource Template"?

"Generate Resource Template" is made to ensure that each resource is a `runtime.Object`.

Official resources are already `runtime.Object`s. They don't need to generate `DeepCopyObject` method.

For custom resources, things are a little bit complex.

If you want to control a predefined resource from a third-party operator, choose **None**. The `DeepCopyObject` method must be already generated using deepcopy-gen. 

If you want a newly-defined resource for the controller, choose **Both** in "Generate Resource Template" field. In this case, koolbuilder will generate definition struct and `DeepCopyObject` for you. All you need is to fill `Spec` and `Status` field.

### My Kubernetes version is old, is it still supported?

Yes. Some official resources do have different versions. You can choose supported version for each resource based on your Kubernetes.

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

Well, it's not a big deal. You can choose to generate structure only and use deepcopy-gen to generate method.

~~(It's because we don't have much time reading and understanding deepcopy-gen and write a generator like that.)~~

## License

The project is licensed under the MIT license.

## Acknowledgement

This project is inspired by [zhaohuabing's tutorial](https://github.com/zhaohuabing/k8scontrollertutorial), which gives a brief and clear introduction to kubernetes operator.

[Kubernetes Controller 机制详解（一）](
https://mp.weixin.qq.com/s?__biz=MzU3MjI5ODgxMA==&mid=2247484264&idx=1&sn=3a49472acb95aa4efd7b4b89f90640f0)

[Kubernetes Controller 机制详解（二）](
https://mp.weixin.qq.com/s?__biz=MzI5ODk5ODI4Nw==&mid=2247532347&idx=4&sn=4275b81f9547fb21c65f96572d25aeb8)

Besides, with a lot of useful frontend libraries, I saved a lot of time writing my pages. They are:

- [Vue](https://github.com/vuejs/vue)
- [Vite](https://github.com/vitejs/vite)
- [Unocss](https://github.com/unocss/unocss)
- [FileSaver](https://github.com/eligrey/FileSaver.js)
- [JSZip](https://github.com/Stuk/jszip)
- [Codemirror-editor-vue3](https://github.com/rennzhang/codemirror-editor-vue3)

## Future Works

- [x] Add GitHub corner
- [ ] Update go command line tool
- [ ] Add `kool-controller.yaml` to support command line tool
- [x] Add `Generate Definition Struct` option
- [x] Add `Generate DeepCopyObject` option
- [x] Add the rest of the official resources (currently we just add some resources in `core`, `apps`, and `batch` group)
- [ ] Support custom sync period (currently all resources are 30s)
- [ ] Add `Dockerfile`, `Makefile`, k8s yaml config files
- [ ] Add `Load Example`