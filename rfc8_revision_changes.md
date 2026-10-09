# RFC-8 revision: summary of changes

**Status:** Proposed revisions, Fall 2026
**Scope:** Changes to RFC-8 (Collections and Extensibility) following the round-1 review, Damien Goutte-Gattat's extensibility proposal and Benedikt Best's comment in [ome/ngff#627](https://github.com/ome/ngff/pull/627).

This document lists every change agreed for RFC-8 so that the RFC text can be updated. Each section states the new rule, what it replaces, and an example. Topics that move to separate sub-RFCs are listed at the end, along with points that still need wording.

---

## 1. Overview

| Area | Current RFC-8 | Revised RFC-8 |
|---|---|---|
| Node types | collection, multiscale, singlescale | collection, multiscale. **Singlescale is removed.** |
| Type-specific metadata | `attributes` dictionary | **`traits`** list of typed objects |
| Free-form metadata | `attributes` | **Removed.** Everything beyond the node fields is a trait. |
| Extensions | Prefixed names (`myorg:foo`) | **URI-based types** declared in an **`extension_manifest`** |
| IDs | Optional, unique per document | **Required, UUIDs** (v7 recommended) |
| Names | Required, unique | **Optional, free-form** |
| References | `{"id": …}` | **`{"type": …, "ref": …}`**, plus an optional `path` |
| Paths | `{"type": "zarr", "path": …}` | **`{"type": "zarr", "format": …, "href": …}`** |
| Multiscales in a collection | Metadata may be inlined | **Always referenced by path, never inlined** |
| Multiscale layout | Singlescale child nodes | **`scales`** list, close to 0.6 `datasets` |
| HCS, labels, bioformats2raw, remote references, snake_case | In RFC-8 | **Deferred to sub-RFCs** |

---

## 2. Node interface and node types

### 2.1 Node interface

Every node has:

| Field | Required | Description |
|---|---|---|
| `type` | yes | Node type: a keyword for built-in types, a URI for extension types |
| `id` | yes | UUID (see §6) |
| `name` | no | Human-readable label, free-form, not required to be unique |
| `traits` | no | List of trait objects (see §3) |

Fields that a node type requires sit directly on the node, for example `coordinate_systems` and `scales` on a multiscale, or `nodes` on a collection.

The `attributes` dictionary is removed. There is no free-form metadata field. Any additional information must be expressed as a trait.

### 2.2 Node types

- **Core node types:** `collection` and `multiscale`. Node types are purely structural: they tell a reader how to traverse the tree.
- **`singlescale` is removed.** Scale levels are listed inside the multiscale (see §8).
- Extensions MAY define additional node types, identified by URI (see §4).

---

## 3. Traits

Traits replace `attributes`. The design is inspired by Rust traits: shared behaviour that a type opts into and combines freely, instead of inheriting it from a parent type.

### 3.1 Rules

- `traits` is a list of objects. Each trait has a `type`: a keyword for built-in traits, a URI for extension traits.
- Traits are composable. A node can carry several traits, for example `well` and `scene`.
- A trait's fields sit inside the trait object. Fields required by the node type sit on the node.
- Both collections and multiscales can carry traits.
- **Combining traits.** A multiscale can carry traits in its own `zarr.json` and on the node that declares it in a collection. The two lists are combined. If both contain a trait of the same `type`, the trait on the declaring node in the collection overrides the one in the multiscale's own document.
- Each trait's schema states its rules:
  - `applies_to`: the node types that may carry it (for example `plate` → collection, `labels` → multiscale)
  - `excludes`: traits it cannot be combined with
  - constraints on child nodes (for example a `plate` collection's children are collections with a `well` trait)
- Readers MUST preserve traits they don't recognise and pass them through to client code.

### 3.2 Example

```json
{
  "type": "collection",
  "id": "0192f3a0-7c1e-7b00-9c22-000000000007",
  "traits": [
    { "type": "well", "row_index": 0, "column_index": 0 },
    {
      "type": "scene",
      "coordinate_systems": [ ... ],
      "coordinate_transformations": [ ... ]
    }
  ],
  "nodes": [ ... ]
}
```

---

## 4. Extension mechanism

Based on Damien Goutte-Gattat's extensibility proposal.

### 4.1 Rules

- Extension types (node types and traits) are identified by **URIs derived from the extension's ID**, for example `https://napari.org/ngff/rendering`. This replaces prefixed names such as `napari:rendering`, so independently developed extensions cannot clash.
- Every extension used in a document is declared in an **`extension_manifest`** under the `ome` key, listing:
  - `id`: the extension URI
  - `version`
  - `schemas`: a list of `{ "type": "json_schema" | "linkml", "url": … }`
  - `homepage` (optional)
- Readers can list every extension a file uses, with its schema, without a central registry.
- Extensions can add new node types, or add traits to existing node types such as collections and multiscales.

The `must_understand` flag from earlier drafts is **not** part of the manifest.

### 4.2 Example

```json
{
  "ome": {
    "version": "0.x",
    "extension_manifest": [
      {
        "id": "https://napari.org/ngff/",
        "version": "1.0",
        "schemas": [
          { "type": "json_schema", "url": "https://napari.org/ngff/1.0/schema.json" }
        ],
        "homepage": "https://napari.org/ngff/"
      }
    ],
    "type": "collection",
    ...
  }
}
```

Using an extension trait on a node:

```json
"traits": [
  { "type": "https://napari.org/ngff/rendering", "contrast_limits": [0, 1500] }
]
```

---

## 5. Tiers of types

Types fall into three tiers, which correspond to MUST, SHOULD and MAY for implementations.

| Tier | Requirement | Identifier | Examples |
|---|---|---|---|
| **Core types** | MUST be supported | keyword (built-in) | node types `collection`, `multiscale`; path format `relative` |
| **Recommended types** | SHOULD be supported where relevant | keyword (built-in) | traits `plate`, `well`, `labels`, `bioformats2raw` |
| **Extension types** | MAY be supported | URI (custom) | trait `https://napari.org/ngff/rendering` |

Core and recommended types are **built-in**: they are part of the spec and use plain keywords. Extension types are **custom** and use URIs.

The terminology is not final. Alternative terms that came up: "essential types" or "structure / scaffolding" for tier 1, "core extensions" or "OME extensions" for tier 2, "custom types" or "third-party extensions" for tier 3.

Most recommended types are specified in sub-RFCs (see §11).

---

## 6. IDs and names

- `id` is **required** on every declared object: nodes, scales and coordinate systems.
- IDs MUST be **UUIDs**. UUIDv7 is RECOMMENDED, because its timestamp prefix keeps IDs roughly sorted by creation time. Other UUID versions remain valid.
- `name` is **optional and free-form**. The rule that names must be unique is removed.

Because IDs are globally unique, a node that is declared in a collection and points to another document by path uses the **same UUID** as the root of that document.

---

## 7. Declarations, references and paths

### 7.1 Declarations

A declaration defines an object and its UUID. Declarations appear in arrays such as `nodes`, `scales` and `coordinate_systems`.

- **Every declaration carries `type`**, which is the object's own kind: for example `"collection"` or `"multiscale"` for nodes, `"scale"` for scales and `"coordinate_system"` for coordinate systems.
- Every declaration carries an `id` (see §6).
- Declarations carry fields, traits and child nodes.

### 7.2 References

A reference points to an object declared elsewhere. References appear in fields such as `input`, `output` and `source`.

- A reference has a **`type`**: the kind of the target, for example `"scale"`, `"coordinate_system"`, `"multiscale"`.
- A reference has a **`ref`**: the UUID of the target. References use `ref`, not `id`, so a reference can always be told apart from a declaration.
- A reference MAY have a **`path`** to locate the document that contains the target.
- A reference contains only `type`, `ref` and an optional `path`. It MUST NOT carry traits or child nodes.
- A bare `ref` resolves in the current document. With a `path`, it resolves in the referenced document.

Prior art: OME-XML (`…Ref` elements), FHIR (`reference`) and STAC (`href`) also separate declaration and reference keys.

**Coordinate systems get IDs and are referenced by ID.**

```json
"input":  { "type": "scale", "ref": "0192f3a0-7c1e-7b00-9c22-00000000000c" },
"output": { "type": "coordinate_system", "ref": "0192f3a0-7c1e-7b00-9c22-000000000020" }
```

Reference into another document:

```json
"input": {
  "type": "coordinate_system",
  "path": { "type": "zarr", "format": "relative", "href": "./raw" },
  "ref": "0192f3a0-7c1e-7b00-9c22-000000000020"
}
```

### 7.3 Paths

Path objects have the form:

```json
{ "type": "zarr", "format": "relative", "href": "./raw" }
```

- `path.path` is renamed to **`href`**.
- **`format`** is explicit: `"relative"`, `"absolute"` or `"http"`. Readers no longer infer it from the string, for example from an `https://` prefix.
- Only `relative` is a core path format. `absolute` and `http` are specified in the "Absolute and remote references" sub-RFC (see §11).
- Relative paths resolve from the document that contains them.
- **Typed paths:** the document at a node's `path` MUST have a root of the declared node type. A `multiscale` node's path, for example, MUST resolve to a multiscale document.
- **No cycles:** resolving paths MUST NOT form a cycle.

---

## 8. Multiscales

### 8.1 Always referenced, never inlined

A collection never inlines multiscale metadata. Each multiscale in a collection is a node with a `path` to the image's own `zarr.json`. This gives:

- **One source of truth:** no inline copy can drift from the image, so no conflict or override rules are needed.
- **Self-contained images:** every multiscale is valid on its own and can be opened without its collection.
- **Small collections:** a collection lists nodes, traits and paths only.

The node in the collection and the root of the multiscale document share the same UUID.

### 8.2 Multiscale layout, close to 0.6

- The 0.6 `multiscales` array is replaced by a single multiscale per node.
- **`coordinate_systems`** sit directly on the multiscale node, each with `"type": "coordinate_system"` and an `id`.
- **`scales`** replaces 0.6 `datasets`. Each scale has `"type": "scale"`, an `id`, a path object and its own **`coordinate_transformations`**, mapping the scale into a coordinate system, as in 0.6.
- The multiscale MAY carry `traits`.

### 8.3 Example

Collection, `zarr.json`:

```json
{
  "ome": {
    "version": "0.x",
    "type": "collection",
    "id": "0192f3a0-7c1e-7b00-9c22-000000000001",
    "nodes": [
      {
        "type": "multiscale",
        "id": "0192f3a0-7c1e-7b00-9c22-000000000002",
        "name": "raw",
        "path": { "type": "zarr", "format": "relative", "href": "./raw" }
      }
    ]
  }
}
```

Multiscale, `raw/zarr.json`:

```json
{
  "ome": {
    "version": "0.x",
    "type": "multiscale",
    "id": "0192f3a0-7c1e-7b00-9c22-000000000002",
    "name": "raw",
    "coordinate_systems": [
      {
        "type": "coordinate_system",
        "id": "0192f3a0-7c1e-7b00-9c22-000000000020",
        "name": "physical",
        "axes": [
          { "name": "c", "type": "channel" },
          { "name": "z", "type": "space", "unit": "micrometer" },
          { "name": "y", "type": "space", "unit": "micrometer" },
          { "name": "x", "type": "space", "unit": "micrometer" }
        ]
      }
    ],
    "scales": [
      {
        "type": "scale",
        "id": "0192f3a0-7c1e-7b00-9c22-00000000000c",
        "path": { "type": "zarr", "format": "relative", "href": "./s0" },
        "coordinate_transformations": [
          {
            "type": "scale",
            "scale": [1, 0.5, 0.1, 0.1],
            "input": { "type": "scale", "ref": "0192f3a0-7c1e-7b00-9c22-00000000000c" },
            "output": { "type": "coordinate_system", "ref": "0192f3a0-7c1e-7b00-9c22-000000000020" }
          }
        ]
      },
      {
        "type": "scale",
        "id": "0192f3a0-7c1e-7b00-9c22-00000000000d",
        "path": { "type": "zarr", "format": "relative", "href": "./s1" },
        "coordinate_transformations": [
          {
            "type": "scale",
            "scale": [1, 0.5, 0.2, 0.2],
            "input": { "type": "scale", "ref": "0192f3a0-7c1e-7b00-9c22-00000000000d" },
            "output": { "type": "coordinate_system", "ref": "0192f3a0-7c1e-7b00-9c22-000000000020" }
          }
        ]
      }
    ]
  }
}
```

### 8.4 Remaining differences from 0.6

`scales` instead of `datasets`, path objects instead of path strings, `type` and `id` on scales and coordinate systems, typed references in `input`/`output`, one multiscale per node instead of the `multiscales` array, and snake_case keys (see §10).

---

## 9. Consolidated metadata

Add a non-normative section on IO performance:

- Zarr consolidated metadata MAY be used to bundle the `zarr.json` documents of referenced nodes into the root, so readers can load the whole tree in one request. This also applies to nested collections, which stay separate documents.
- The **individual `zarr.json` files remain the source of truth**. The consolidated copy is only a cache and can go stale.
- Keeping the cache consistent with the individual files would require an external transaction system, such as Icechunk or a custom database.
- It is pure Zarr with no OME-specific rules: readers without support fetch each node.
- The Zarr-level specification of consolidated metadata is currently incomplete.

---

## 10. Naming conventions

The examples in this report use snake_case keys (`coordinate_systems`, `row_index`, `json_schema`, …). Casing is left to the snake_case sub-RFC (see §11) and is not changed by this revision.

---

## 11. Deferred to future sub-RFCs

These topics are removed from RFC-8 and will be specified in separate sub-RFCs:

| Topic | Scope |
|---|---|
| **HCS** | Plate and well traits |
| **Labels** | Label image traits and per-label properties |
| **bioformats2raw and OME-XML** | Series layout and the OME/METADATA.ome.xml mapping |
| **Absolute and remote references** | Absolute paths and URLs, authentication and security |
| **snake_case** | Making keys and identifiers consistent with Zarr |
| **Legacy multiscales** | A `legacy_multiscale` node type for unchanged 0.5 and 0.6 images |

RFC-8 should define the trait and path mechanisms these sub-RFCs build on, and name the sub-RFCs as follow-up work.

### Legacy multiscales (proposal for the sub-RFC)

A `legacy_multiscale` node mounts an existing 0.5 or 0.6 image in a collection without converting it:

```json
{
  "type": "legacy_multiscale",
  "id": "0192f3a0-7c1e-7b00-9c22-00000000005c",
  "path": { "type": "zarr", "format": "relative", "href": "./scan_2023" },
  "traits": [ ... ]
}
```

- Existing data stays untouched, including `omero` and `OME/METADATA.ome.xml`.
- The target is read with the rules of its own version. Traits on the declaring node add to it.
- Coordinate systems inside the legacy image are addressed by name in 0.6, or as the implicit one in 0.5.

---

## 12. Point still to specify

**Machine-readable trait rules.** §3.1 defines what each trait's rules cover: `applies_to`, `excludes` and constraints on child nodes. It does not yet define how these are written down. A trait's JSON Schema can describe the trait's own fields, but the other rules are about the node that carries the trait, its other traits and its children. Options:

- state them in the trait's documentation only, and check them in validator code;
- add fields such as `applies_to` and `excludes` to the extension manifest or trait definition, so validators can read them;
- express them as JSON Schema on the node (`if`/`then`, `not`), which works but is hard to read.

---

## 13. Feedback addressed

| Feedback | Resolution |
|---|---|
| `attributes` mixes required, optional and extension metadata | Replaced by typed traits; node-type fields on the node (§2, §3) |
| Node subtypes inferred by inspecting `attributes` | Typed traits with schemas (§3) |
| Prefix namespacing is weak; no schema discovery | URI-based types and `extension_manifest` (§4) |
| Extensions should be a separate RFC | Extension mechanism specified in RFC-8; content types moved to sub-RFCs (§4, §11) |
| Name uniqueness is hard to validate | Names optional and free-form (§6) |
| Required / unique IDs, ideally UUIDs | IDs required, as UUIDs (§6) |
| References point to different kinds of objects depending on context | Typed references with `type` and `ref` (§7.2) |
| `path.path` reads awkwardly; path format inferred from the string | `href` and explicit `format` (§7.3) |
| No rules for inline vs referenced metadata conflicts | Multiscales are never inlined (§8.1) |
| Purpose of singlescale unclear; transform split confusing | Singlescale removed; 0.6-style scales with their own transforms (§8.2) |
| Scaling to many nodes; IO performance | Consolidated metadata as an optional cache (§9) |
| snake_case | Deferred to sub-RFC (§10, §11) |
| HCS gaps, label colour metadata, bioformats2raw / OME-XML upgrade path | Deferred to sub-RFCs (§11) |
| Security and portability of remote references | Deferred to sub-RFC (§11) |
| No upgrade path for existing 0.5 / 0.6 data | `legacy_multiscale` proposed for a sub-RFC (§11) |
