<script setup lang="ts">
import { computed, ref } from "vue";
import CodeMirror from "./CodeMirror.vue";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Resource, getAlias, getVersionFromPackage, group2Versions, lowerKind, kindDeepCopyGen } from "./helper";

const koolVersion = "0.1.0";
const defaultName = "KoolController";
const goVersionOptions: string[] = ["1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.20", "1.19", "1.18"];
const k8sApiVersionOptions: string[] = ["0.28.3", "0.28.2"];

const builtinResourcesOptions: Resource[] = [
  {
    isCustomResource: false,
    kind: "Deployment",
    group: "apps",
    version: "v1",
    package: "k8s.io/api/apps/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "StatefulSet",
    group: "apps",
    version: "v1",
    package: "k8s.io/api/apps/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "ReplicaSet",
    group: "apps",
    version: "v1",
    package: "k8s.io/api/apps/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "DaemonSet",
    group: "apps",
    version: "v1",
    package: "k8s.io/api/apps/v1",
    isNamespaced: true,
  },

  {
    isCustomResource: false,
    kind: "Job",
    group: "batch",
    version: "v1",
    package: "k8s.io/api/batch/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "CronJob",
    group: "batch",
    version: "v1",
    package: "k8s.io/api/batch/v1",
    isNamespaced: true,
  },

  {
    isCustomResource: false,
    kind: "Binding",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "Pod",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "PodTemplate",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "Endpoints",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "ReplicationController",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
  {
    isCustomResource: false,
    kind: "Node",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: false,
  },
  {
    isCustomResource: false,
    kind: "Namespace",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: false,
  },
  {
    isCustomResource: false,
    kind: "Service",
    group: "core",
    version: "v1",
    package: "k8s.io/api/core/v1",
    isNamespaced: true,
  },
];

const controllerName = ref<string>(defaultName);
const lowerControllerName = computed<string>(() => controllerName.value.toLowerCase());
const customGoModuleName = ref<boolean>(false);
const customGoModule = ref<string>(defaultName.toLowerCase());
const goModule = computed<string>(() => {
  return customGoModuleName.value ? customGoModule.value : lowerControllerName.value;
});
const goVersion = ref<string>(goVersionOptions[0]);
const k8sApiVersion = ref<string>(k8sApiVersionOptions[0]);
const retry = ref<number>(3);
const namespace = ref<string>("");

const podResource: Resource = { ...builtinResourcesOptions[7] };
const resources = ref<Resource[]>([podResource]);

const imports = computed<string[]>(() => {
  const set = new Set<string>();
  resources.value.forEach((item) => {
    if (typeof item.package === "undefined") {
      return;
    }
    if (!item.isCustomResource && item.kind.length > 0) {
      set.add(`k8s.io/api/${item.group}/${item.version}`);
      return;
    }
    item.package.length === 0 || item.package === goModule.value || set.add(item.package);
  });
  return Array.from(set).sort();
});

function addResource() {
  resources.value.push({
    isCustomResource: true,
    kind: "",
    package: "",
    isNamespaced: true,
  });
}

function deleteResource(index: number) {
  resources.value.splice(index, 1);
}

function changeCustomGoModuleNameFlag() {
  if (customGoModuleName.value) {
    customGoModule.value = lowerControllerName.value;
  }
}

function changeKind(index: number) {
  const newItem = builtinResourcesOptions.filter((i) => i.kind === resources.value[index].kind)[0];
  resources.value[index] = { ...newItem };
}

function resetResource(index: number) {
  resources.value[index].group = "";
  resources.value[index].version = "";
  resources.value[index].package = "";
  if (resources.value[index].isCustomResource) {
    resources.value[index].kind = "";
  }
}

function tryResetResourceVersion(index: number) {
  const v = getVersionFromPackage(resources.value[index].package);
  if (v.length > 0) {
    resources.value[index].version = v;
  }
}

// code

const _goMod = computed<string>(() => {
  return `module ${goModule.value}

go ${goVersion.value}

require (
	github.com/FlyingOnion/kool v${koolVersion}
	github.com/mitchellh/mapstructure v1.5.0
	github.com/spf13/pflag v1.0.5
	k8s.io/apimachinery v${k8sApiVersion.value}
	k8s.io/client-go v${k8sApiVersion.value}
	k8s.io/klog/v2 v2.110.1
)
`;
});
// prettier-ignore
const _main = computed<string>(() => {
  return `// Code generated by koolbuilder. DO NOT EDIT.

package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/FlyingOnion/kool"
	"github.com/spf13/pflag"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/workqueue"
	"k8s.io/klog/v2"
	${imports.value.map((pkg) => `${getAlias(pkg)} "${pkg}"`).join("\n\t")}
)

func mustGetOrLogFatal[T any](v T, err error) T {
	if err != nil {
		klog.Fatal(err)
	}
	return v
}

func addKnownTypes(s *runtime.Scheme) {
${resources.value
  .filter((item) => item.isCustomResource)
  .map(
    (item) =>
`\ts.AddKnownTypes(schema.GroupVersion{
\t\tGroup:   "${item.group || "undefined"}",
\t\tVersion: "${item.version || "undefined"}",
\t}, &${goType(item)}{})\n`
  )}}

func main() {
	var kubeconfig string
	var master string

	pflag.StringVar(&kubeconfig, "kubeconfig", "", "absolute path to the kubeconfig file")
	pflag.StringVar(&master, "master", "", "master url")
	pflag.Parse()

	addKnownTypes(scheme.Scheme)

	config := mustGetOrLogFatal(clientcmd.BuildConfigFromFlags(master, kubeconfig))
	client := mustGetOrLogFatal(rest.RESTClientFor(config))

${resources.value
  .map((item) => `\t${lowerKind(item.kind)}Informer := kool.New${
    item.isNamespaced && namespace.value.length > 0 ? "Namespaced" : ""
  }Informer[${goType(item)}](client, ${item.isNamespaced && namespace.value.length > 0 ? `"${namespace.value}", ` : ""}30*time.Second)`)
  .join("\n")}

	queue := workqueue.NewRateLimitingQueue(workqueue.DefaultControllerRateLimiter())
	controller := New${controllerName.value}(${resources.value.map((item) => `${lowerKind(item.kind)}Informer, `)}queue, ${retry.value})

	sigC := make(chan os.Signal, 1)
	signal.Notify(sigC, syscall.SIGINT, syscall.SIGTERM)

	ctx, cancel := context.WithCancel(context.Background())

	go controller.Run(ctx, 1)

	select {
	case sig := <-sigC:
		klog.Infof("Received signal: %s", sig)
		signal.Stop(sigC)
		cancel()
	case <-ctx.Done():
	}
}
`;
});
// prettier-ignore
const _controller = computed<string>(() => {
  return `// Code generated by koolbuilder. DO NOT EDIT.

package main

import (
	"context"
	"errors"
	"time"

	"github.com/FlyingOnion/kool"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/util/workqueue"
	"k8s.io/klog/v2"
	${imports.value.map((pkg) => `${getAlias(pkg)} "${pkg}"`).join("\n\t")}
)

var (
	ErrSyncTimeout = errors.New("Timed out waiting for caches to sync")
)

type ${controllerName.value} struct {
${resources.value
  .map((item) => `\t${lowerKind(item.kind)}Lister kool.${item.isNamespaced && namespace.value.length > 0 ? "Namespaced" : ""}Lister[${goType(item)}]`)
  .join("\n")}

${resources.value
  .map((item) => `\t${lowerKind(item.kind)}Synced cache.InformerSynced`)
  .join("\n")}

	queue        workqueue.RateLimitingInterface
	retryOnError int
}

func New${controllerName.value}(
${resources.value
  .map((item) => `\t${lowerKind(item.kind)}Informer kool.${item.isNamespaced ? "Namespaced" : ""}Informer[${goType(item)}],`)
  .join("\n")}
) *${controllerName.value} {
	c := &${controllerName.value}{
		queue:        queue,
		retryOnError: retryOnError,
	}
${resources.value
  .map(
    (item) =>
`\t${lowerKind(item.kind)}Informer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
\t\tAddFunc: c.Add${item.kind || "UnknownType"},
\t\tUpdateFunc: c.Update${item.kind || "UnknownType"},
\t\tDeleteFunc: c.Delete${item.kind || "UnknownType"},
\t})`
  )
  .join("\n")}

${resources.value
  .map(
    (item) =>
`\tc.${lowerKind(item.kind)}Lister = ${lowerKind(item.kind)}Informer.Lister()
\tc.${lowerKind(item.kind)}Synced = ${lowerKind(item.kind)}Informer.Informer().HasSynced`
  )
  .join("\n")}
	return c
}

func (c *${controllerName.value}) Run(ctx context.Context, workers int) {
	defer utilruntime.HandleCrash()

	// Let the workers stop when we are done
	defer c.queue.ShutDown()
	logger := klog.FromContext(ctx)
	logger.Info("Starting ${lowerKind(resources.value[0].kind)} controller")
	defer logger.Info("Stopping ${lowerKind(resources.value[0].kind)} controller")

	// Wait for all involved caches to be synced, before processing items from the queue is started
	if !cache.WaitForCacheSync(ctx.Done()${resources.value.map((item) => `, c.${lowerKind(item.kind)}Synced`)}) {
		utilruntime.HandleError(ErrSyncTimeout)
		return
	}

	for i := 0; i < workers; i++ {
		go wait.UntilWithContext(ctx, c.runWorker, time.Second)
	}

	<-ctx.Done()
}

func (c *${controllerName.value}) runWorker(ctx context.Context) {
	for c.processNextWorkItem(ctx) {
	}
}

func (c *${controllerName.value}) processNextItem(ctx context.Context) bool {
	// Wait until there is a new item in the working queue
	key, quit := c.queue.Get()
	if quit {
		return false
	}
	// Tell the queue that we are done with processing this key. This unblocks the key for other workers
	// This allows safe parallel processing because two pods with the same key are never processed in
	// parallel.
	defer c.queue.Done(key)

	// Invoke the method containing the business logic
	err := c.Sync${resources.value[0].kind || "UnknownType"}(ctx, key.(string))
	// Handle the error if something went wrong during the execution of the business logic
	c.handleErr(ctx, err, key)

	return true
}

func (c *${controllerName.value}) sync${resources.value[0].kind || "UnknownType"}(ctx context.Context, key string) error {
	logger := klog.FromContext(ctx)
	namespace, name, err := cache.SplitMetaNamespaceKey(key)
	if err != nil {
		logger.Error(err, "Failed to split meta namespace cache key", "cacheKey", key)
		return err
	}
	return c.doSync${resources.value[0].kind || "UnknownType"}(ctx, namespace, name)
}

func (c *${controllerName.value}) handleErr(ctx context.Context, err error, key interface{}) {
	if err == nil {
		c.queue.Forget(key)
		return
	}

	logger := klog.FromContext(ctx)

	if c.queue.NumRequeues(key) < c.retryOnError {
		logger.Error(err, "Failed to sync object", "cacheKey", key)
		c.queue.AddRateLimited(key)
		return
	}

	c.queue.Forget(key)
	utilruntime.HandleError(err)
	logger.Info("Dropping object out of the queue", "cacheKey", key)
}
`;
});
// prettier-ignore
const _custom = computed<string>(() => {
  return `package main

// This file contains all customized functions.
// Regeneration will not cover the codes.
// Feel free to modify.

import (
	"context"
	"fmt"

	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/client-go/tools/cache"
	${imports.value.map((pkg) => `${getAlias(pkg)} "${pkg}"`).join("\n\t")}
)

var _ *${goType(resources.value[0])} = nil

func (c *${controllerName.value}) doSync${resources.value[0].kind || "UnknownType"}(ctx context.Context, namespace, name string) error {
	// TODO: modify this function

	// ATTENTION: this function may cause error if you regenerate the code with namespace change
	// from ""(global) to non-empty(namespaced) or vice versa

	// switch following code between global and namespaced lister
	//  // global lister
	//  c.${lowerKind(resources.value[0].kind)}Lister.Namespaced(namespace).Get(name)
	//  // namespaced lister
	//  c.${lowerKind(resources.value[0].kind)}Lister.Get(name)

	return nil
}

func (c *${controllerName.value}) Add${resources.value[0].kind || "UnknownType"}(obj any) {
	key, err := cache.MetaNamespaceKeyFunc(obj)
	if err != nil {
		utilruntime.HandleError(fmt.Errorf("couldn't get key for object %+v: %v", obj, err))
		return
	}
	c.queue.AddRateLimited(key)
}

func (c *${controllerName.value}) Update${resources.value[0].kind || "UnknownType"}(oldObj, newObj any) {
	key, err := cache.MetaNamespaceKeyFunc(curObj)
	if err != nil {
		utilruntime.HandleError(fmt.Errorf("couldn't get key for object %+v: %v", curObj, err))
		return
	}
	c.queue.AddRateLimited(key)
}

func (c *${controllerName.value}) Delete${resources.value[0].kind || "UnknownType"}(obj any) {
	key, err := cache.DeletionHandlingMetaNamespaceKeyFunc(obj)
	if err != nil {
		utilruntime.HandleError(fmt.Errorf("couldn't get key for object %+v: %v", obj, err))
		return
	}
	c.queue.AddRateLimited(key)
}
${resources.value.slice(1).map(
  (item) =>
    `
func (c *${controllerName.value}) Add${item.kind || "UnknownType"}(obj any) {
	${lowerKind(item.kind)} := obj.(*${goType(item)})
	// TODO: do something with ${lowerKind(item.kind)}
	_ = ${lowerKind(item.kind)}
}

func (c *${controllerName.value}) Update${item.kind || "UnknownType"}(oldObj, newObj any) {
	old := oldObj.(*${goType(item)})
	cur := newObj.(*${goType(item)})
	// TODO: do something with old and cur
	_, _ = old, cur
}

func (c *${controllerName.value}) Delete${item.kind || "UnknownType"}(obj any) {
	${lowerKind(item.kind)}, ok := obj.(*${goType(item)})
	if !ok {
		// error handling
		tombstone, ok := obj.(cache.DeletedFinalStateUnknown)
		if !ok {
			runtime.HandleError(fmt.Errorf("couldn't get object from tombstone %#v", obj))
			return
		}
		${lowerKind(item.kind)}, ok = tombstone.Obj.(*${goType(item)})
		if !ok {
			runtime.HandleError(fmt.Errorf("tombstone contained object that is not a bar %#v", obj))
			return
		}
	}
}`
)}
`;
});

const files: string[] = ["go.mod", "main.go", "controller.go", "custom.go"];
const currentFile = ref<string>("main.go");
const filesMap = {
  "go.mod": _goMod,
  "main.go": _main,
  "controller.go": _controller,
  "custom.go": _custom,
};
const code = computed<string>(() => {
  const r = filesMap[currentFile.value];
  return r.value || "";
});

function changeFile(file: string) {
  currentFile.value = file;
}

function goType(rs: Resource): string {
  return rs.kind.length === 0
    ? "UnknownType"
    : rs.isCustomResource && (rs.package?.length === 0 || rs.package === goModule.value)
    ? rs.kind
    : getAlias(rs.package) + "." + rs.kind;
}

function download() {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file, filesMap[file].value);
  }
  // zip.file("go.mod", _goMod.value);
  // zip.file("main.go", _main.value);
  // zip.file("controller.go", _controller.value);

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${controllerName.value}.zip`);
  });
}
</script>

<template>
  <div grid grid-cols-3 gap-4 p-4>
    <div col-span-3 lg:col-span-1 flex flex-col gap-1>
      <p text-2xl font-semibold leading-7 text-gray-900>Koolbuilder</p>
      <p text-base leading-6 text-gray-600>Build your kubernetes operator easily</p>
      <p>(WIP)</p>
      <p text-xl font-semibold leading-10 text-gray-600>Basic</p>

      <!-- controller name -->
      <label for="controller">Controller Name</label>
      <input id="controller" v-model="controllerName" border rounded px-2 />
      <!-- go module -->
      <label for="custom-go-module">Go Module Name</label>
      <select id="custom-go-module" v-model="customGoModuleName" @change="changeCustomGoModuleNameFlag" border rounded px-1>
        <option :value="false">Use lowercase controller name</option>
        <option :value="true">Use custom name</option>
      </select>
      <input v-if="customGoModuleName" id="go-module" v-model="customGoModule" border rounded px-2 />
      <input v-else id="go-module" v-model="lowerControllerName" disabled border rounded px-2 disabled-bg-light />
      <!-- go version -->
      <label for="go-version">Go Version</label>
      <select id="go-version" v-model="goVersion" border rounded px-1>
        <option v-for="item in goVersionOptions" :key="item" :value="item">{{ item }}</option>
      </select>
      <!-- k8s api version -->
      <label for="k8s-api-version">Kubernetes API Version</label>
      <select id="k8s-api-version" v-model="k8sApiVersion" border rounded px-1>
        <option v-for="item in k8sApiVersionOptions" :key="item" :value="item">{{ item }}</option>
      </select>
      <!-- namespace -->
      <label for="namespace">Namespace</label>
      <input id="namespace" v-model="namespace" border rounded px-2 />
      <!-- retry -->
      <label for="retry">Retry</label>
      <input id="retry" type="number" v-model="retry" border rounded px-2 />

      <p text-xl font-semibold leading-10 text-gray-600>Resources</p>
      <template v-for="(item, index) in resources" :key="index">
        <!-- title and delete button -->
        <div flex>
          <p flex-grow text-lg font-400 leading-8 text-gray-600 select-none>
            {{ index === 0 ? "Main Resource" : "Resource " + index.toString() }}
          </p>
          <button
            type="button"
            v-if="index > 0"
            @click="deleteResource(index)"
            flex
            items-center
            rounded
            px-1
            py-1
            font-sans
            text-sm
            hover:bg-gray-100
          >
            Delete
            <span i-tabler-trash></span>
          </button>
        </div>

        <!-- resource type -->
        <label :for="'custom-' + index.toString()">Official / Custom</label>
        <select :id="'custom-' + index.toString()" v-model="item.isCustomResource" @change="resetResource(index)" border rounded px-1>
          <option :value="false">Official</option>
          <option :value="true">Custom</option>
        </select>
        <!-- kind -->
        <label :for="'kind-' + index.toString()">Kind</label>
        <input v-if="item.isCustomResource" :id="'kind-' + index.toString()" v-model="item.kind" border rounded px-2 />
        <select v-else :id="'kind-' + index.toString()" v-model="item.kind" @change="changeKind(index)" border rounded px-1>
          <option v-for="item in builtinResourcesOptions" :key="item.kind" :value="item.kind">
            {{ item.kind }}
          </option>
        </select>
        <!-- group -->
        <label :for="'group-' + index.toString()">Group</label>
        <input
          :id="'group-' + index.toString()"
          v-model="item.group"
          :disabled="!item.isCustomResource"
          border
          rounded
          px-2
          disabled-bg-light
        />
        <!-- version -->
        <label :for="'version-' + index.toString()">Version</label>
        <template v-if="item.isCustomResource">
          <input :id="'version-' + index.toString()" v-model="item.version" list="versionList" border rounded px-2 />
          <datalist id="versionList">
            <option>v1</option>
            <option>v1alpha1</option>
            <option>v1alpha2</option>
            <option>v1beta1</option>
            <option>v1beta2</option>
            <option>v2</option>
            <option>v2alpha1</option>
            <option>v2alpha2</option>
            <option>v2beta1</option>
            <option>v2beta2</option>
          </datalist>
        </template>
        <select
          v-else
          :id="'version-' + index.toString()"
          v-model="item.version"
          :disabled="item.kind.length === 0"
          border
          rounded
          px-1
          disabled-bg-light
        >
          <option v-for="version in group2Versions(item.group)" :key="version" :value="version">{{ version }}</option>
        </select>
        <!-- package -->
        <label v-show="item.isCustomResource" :for="'package-' + index.toString()">Package</label>
        <input
          v-show="item.isCustomResource"
          :id="'package-' + index.toString()"
          v-model="item.package"
          @change="tryResetResourceVersion(index)"
          border
          rounded
          px-2
        />
        <!-- scope -->
        <label :for="'namespaced-' + index.toString()">Scope</label>
        <select
          :id="'namespaced-' + index.toString()"
          v-model="item.isNamespaced"
          :disabled="!item.isCustomResource"
          border
          rounded
          px-1
          disabled-bg-light
        >
          <option :value="true">Namespaced</option>
          <option :value="false">Cluster</option>
        </select>
      </template>
      <button @click="addResource" flex items-center justify-center rounded px-1 py-1 font-sans text-sm hover:bg-gray-100>
        Add
        <span i-tabler-circle-plus></span>
      </button>
    </div>

    <div col-span-3 lg:col-span-2 flex flex-col gap-1>
      <div flex>
        <p text-xl font-semibold leading-10 text-gray-600 flex-grow>Output</p>
        <button @click="download" flex items-center justify-center rounded px-2 py-2 font-semibold text-sm text-gray-600 hover:bg-gray-100>
          Download Zip
          <span i-tabler-download></span>
        </button>
      </div>

      <ul flex gap-1>
        <li v-for="f in files" :key="f">
          <a
            text-center
            rounded
            px-1
            py-1
            font-sans
            text-sm
            cursor-pointer
            hover:bg-gray-100
            :class="{ 'bg-gray-300': f === currentFile }"
            role="tab"
            :aria-selected="f === currentFile"
            @click="changeFile(f)"
            >{{ f }}</a
          >
        </li>
        <li v-for="r in resources.filter((r) => r.genDeepCopy)" :key="r.kind">
          <a
            text-center
            rounded
            px-1
            py-1
            font-sans
            text-sm
            cursor-pointer
            hover:bg-gray-100
            role="tab"
            :aria-selected="kindDeepCopyGen(r.kind) === currentFile"
            @click="changeFile(kindDeepCopyGen(r.kind))"
            >{{ kindDeepCopyGen(r.kind) }}</a
          >
        </li>
      </ul>

      <code-mirror :code="code"></code-mirror>
    </div>
    <!-- <code-mirror :code="code" col-span-2></code-mirror> -->
  </div>
</template>
