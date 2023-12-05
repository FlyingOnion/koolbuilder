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

// const kindGroupMap: MapStringString = {
//   Deployment: "apps",
//   StatefulSet: "apps",
//   ReplicaSet: "apps",
//   DaemonSet: "apps",

//   Job: "batch",
//   CronJob: "batch",

//   Binding: "core",
//   Pod: "core",
//   PodTemplate: "core",
//   Endpoints: "core",
//   ReplicationController: "core",
//   Node: "core",
//   Namespace: "core",
//   Service: "core",
//   // TODO: add the rest
// };

// function kind2Group(kind: string | undefined): string {
//   return typeof kind === "undefined" ? "" : kindGroupMap[kind];
// }

// interface MapStringString {
//   [key: string]: string;
// }

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
