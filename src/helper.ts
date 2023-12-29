export interface Resource {
  isCustomResource?: boolean;
  group?: string;
  version?: string;
  kind: string;
  package?: string;
  genDeepCopy?: boolean;
  isNamespaced?: boolean;
}

const versionRegex = /^v\d+((alpha|beta|rc)\d+)?$/;

export function getVersionFromPackage(pkg: string | undefined): string {
  if (typeof pkg === "undefined") {
    return "";
  }
  const ss = pkg.split("/");
  for (let i = ss.length - 1; i >= 0; i--) {
    if (ss[i].match(versionRegex)) {
      return ss[i];
    }
  }
  return "";
}

export function getAlias(pkg: string | undefined): string {
  if (typeof pkg === "undefined") {
    return "undefined";
  }
  const s = pkg.split("/");
  switch (s.length) {
    case 1:
      return pkg;
    case 2:
      return s[1];
  }
  return s[s.length - 1].match(versionRegex)
    ? s[s.length - 2] + s[s.length - 1]
    : s[s.length - 1];
}

export function lowerKind(kind: string): string {
  return kind.toLowerCase() || "unknowntype";
}

export function kindDeepCopyGen(kind: string): string {
  return lowerKind(kind) + "_gen.deepcopy.go";
}

// officialResources should be readonly
export const officialResources: { [key: string]: readonly Resource[] } = {
  apps: [
    {
      kind: "ControllerRevision",
      group: "apps",
      version: "v1",
      package: "k8s.io/api/apps/v1",
      isNamespaced: true,
    },
    {
      kind: "DaemonSet",
      group: "apps",
      version: "v1",
      package: "k8s.io/api/apps/v1",
      isNamespaced: true,
    },
    {
      kind: "Deployment",
      group: "apps",
      version: "v1",
      package: "k8s.io/api/apps/v1",
      isNamespaced: true,
    },
    {
      kind: "ReplicaSet",
      group: "apps",
      version: "v1",
      package: "k8s.io/api/apps/v1",
      isNamespaced: true,
    },
    {
      kind: "StatefulSet",
      group: "apps",
      version: "v1",
      package: "k8s.io/api/apps/v1",
      isNamespaced: true,
    },
  ],
  autoscaling: [
    {
      kind: "HorizontalPodAutoscaler",
      group: "autoscaling",
      version: "v2",
      package: "k8s.io/api/autoscaling/v2",
      isNamespaced: true,
    },
  ],
  batch: [
    {
      kind: "CronJob",
      group: "batch",
      version: "v1",
      package: "k8s.io/api/batch/v1",
      isNamespaced: true,
    },
    {
      kind: "Job",
      group: "batch",
      version: "v1",
      package: "k8s.io/api/batch/v1",
      isNamespaced: true,
    },
  ],
  core: [
    {
      kind: "Binding",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "ConfigMap",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "Endpoints",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "Event",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "Namespace",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: false,
    },
    {
      kind: "Node",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: false,
    },
    {
      kind: "PersistentVolumeClaim",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "PersistentVolume",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: false,
    },
    {
      kind: "Pod",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "PodTemplate",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "ReplicationController",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "ResourceQuota",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "Secret",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "ServiceAccount",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
    {
      kind: "Service",
      group: "core",
      version: "v1",
      package: "k8s.io/api/core/v1",
      isNamespaced: true,
    },
  ],
  "discovery.k8s.io": [
    {
      kind: "EndpointSlice",
      group: "discovery.k8s.io",
      version: "v1",
      package: "k8s.io/api/discovery/v1",
      isNamespaced: true,
    },
  ],
  "networking.k8s.io": [
    {
      kind: "Ingress",
      group: "networking.k8s.io",
      version: "v1",
      package: "k8s.io/api/networking/v1",
      isNamespaced: true,
    },
    {
      kind: "IngressClass",
      group: "networking.k8s.io",
      version: "v1",
      package: "k8s.io/api/networking/v1",
      isNamespaced: false,
    },
    {
      kind: "NetworkPolicy",
      group: "networking.k8s.io",
      version: "v1",
      package: "k8s.io/api/networking/v1",
      isNamespaced: true,
    },
  ],
  "rbac.authorization.k8s.io": [
    {
      kind: "ClusterRole",
      group: "rbac.authorization.k8s.io",
      version: "v1",
      package: "k8s.io/api/rbac/v1",
      isNamespaced: false,
    },
    {
      kind: "ClusterRoleBinding",
      group: "rbac.authorization.k8s.io",
      version: "v1",
      package: "k8s.io/api/rbac/v1",
      isNamespaced: false,
    },
    {
      kind: "Role",
      group: "rbac.authorization.k8s.io",
      version: "v1",
      package: "k8s.io/api/rbac/v1",
      isNamespaced: true,
    },
    {
      kind: "RoleBinding",
      group: "rbac.authorization.k8s.io",
      version: "v1",
      package: "k8s.io/api/rbac/v1",
      isNamespaced: true,
    },
  ],
  "storage.k8s.io": [
    {
      kind: "CSIDriver",
      group: "storage.k8s.io",
      version: "v1",
      package: "k8s.io/api/storage/v1",
      isNamespaced: false,
    },
    {
      kind: "CSINode",
      group: "storage.k8s.io",
      version: "v1",
      package: "k8s.io/api/storage/v1",
      isNamespaced: false,
    },
    {
      kind: "CSIStorageCapacity",
      group: "storage.k8s.io",
      version: "v1",
      package: "k8s.io/api/storage/v1",
      isNamespaced: true,
    },
    {
      kind: "StorageClass",
      group: "storage.k8s.io",
      version: "v1",
      package: "k8s.io/api/storage/v1",
      isNamespaced: false,
    },
    {
      kind: "VolumeAttachment",
      group: "storage.k8s.io",
      version: "v1",
      package: "k8s.io/api/storage/v1",
      isNamespaced: false,
    }
  ]
};

const kindGroupMap: {[key: string]: string} = {
  ControllerRevision: "apps",
  DaemonSet: "apps",
  Deployment: "apps",
  ReplicaSet: "apps",
  StatefulSet: "apps",

  HorizontalPodAutoscaler: "autoscaling",

  Job: "batch",
  CronJob: "batch",

  Binding: "core",
  ConfigMap: "core",
  Endpoints: "core",
  Event: "core",
  Namespace: "core",
  Node: "core",
  PersistentVolumeClaim: "core",
  PersistentVolume: "core",
  Pod: "core",
  PodTemplate: "core",
  ReplicationController: "core",
  ResourceQuota: "core",
  Secret: "core",
  ServiceAccount: "core",
  Service: "core",

  EndpointSlice: "discovery.k8s.io",

  Ingress: "networking.k8s.io",
  IngressClass: "networking.k8s.io",
  NetworkPolicy: "networking.k8s.io",

  ClusterRole: "rbac.authorization.k8s.io",
  ClusterRoleBinding: "rbac.authorization.k8s.io",
  Role: "rbac.authorization.k8s.io",
  RoleBinding: "rbac.authorization.k8s.io",
  
  CSIDriver: "storage.k8s.io",
  CSINode: "storage.k8s.io",
  CSIStorageCapacity: "storage.k8s.io",
  StorageClass: "storage.k8s.io",
  VolumeAttachment: "storage.k8s.io",
};

export function kind2Group(kind: string): string {
  return kindGroupMap[kind] || "undefined";
}

interface MapStringStringArray {
  [key: string]: string[];
}

const groupVersionMap: MapStringStringArray = {
  apps: ["v1"],
  batch: ["v1", "v1beta1"],
  core: ["v1"],
};

export function group2Versions(group: string | undefined): string[] {
  return typeof group === "undefined" ? [] : groupVersionMap[group];
}
