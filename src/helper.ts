export interface Resource {
  isCustomResource?: boolean;
  group?: string;
  version?: string;
  kind: string;
  package?: string;
  template?: Template;
  isNamespaced?: boolean;
}

export enum Template {
  None = 0,
  Definition = 1,
  DeepCopy = 2,
  Both = 3,
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

export function gopkg(pkg: string): string {
  if (pkg.length === 0) {
    return "main"
  }
  const s = pkg.split("/");
  return s[s.length - 1];
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
  discovery: [
    {
      kind: "EndpointSlice",
      group: "discovery.k8s.io",
      version: "v1",
      package: "k8s.io/api/discovery/v1",
      isNamespaced: true,
    },
  ],
  networking: [
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
  rbac: [
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
  storage: [
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

  EndpointSlice: "discovery",

  Ingress: "networking",
  IngressClass: "networking",
  NetworkPolicy: "networking",

  ClusterRole: "rbac",
  ClusterRoleBinding: "rbac",
  Role: "rbac",
  RoleBinding: "rbac",
  
  CSIDriver: "storage",
  CSINode: "storage",
  CSIStorageCapacity: "storage",
  StorageClass: "storage",
  VolumeAttachment: "storage",
};

// use this to get group from kind.
// officialResources should use this to map key.
export function kind2Group(kind: string): string {
  return kindGroupMap[kind] || "undefined";
}

const groupVersionMap: { [key: string]: string[] } = {
  apps: ["v1", "v1beta1", "v1beta2"],
  autoscaling: ["v1", "v2", "v2beta1", "v2beta2"],
  batch: ["v1", "v1beta1"],
  core: ["v1"],
  discovery: ["v1", "v1beta1"],
  networking: ["v1", "v1alpha1", "v1beta1"],
  rbac: ["v1", "v1alpha1", "v1beta1"],
  storage: ["v1", "v1alpha1", "v1beta1"],
};

export function group2Versions(group: string | undefined): string[] {
  return typeof group === "undefined" ? [] : groupVersionMap[group];
}

export interface ResourceGen {
  kind: string;
  package: string;
  fileName: string;
  code: string;
}