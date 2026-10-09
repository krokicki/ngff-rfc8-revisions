const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'RFC-8 revisions';

const DARK='0F1B2D', INK='1B2A3F', ACC='2BB673', MAG='D63E8C', LIGHT='FFFFFF', MUTED='5B6B7F', TINT='EEF3F7', CODEBG='16243A';
const H='Merriweather', B='Lato', C='JetBrains Mono';

function title(s, t, dark){
  s.addText(t,{x:0.5,y:0.35,w:9,h:0.7,fontFace:H,fontSize:30,bold:true,color:dark?LIGHT:INK,margin:0,isTextBox:true});
}
const HL={key:'7FC8F8',str:'A8E6A3',num:'F7B267',kw:'F28FC5',punc:'D7E3F0',dim:'8A9BB0'};
function highlight(txt){
  const runs=[];
  const lines=txt.split('\n');
  const re=/("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|(true|false|null)|(\.\.\.)|([^"\d.tfn-]+|.)/g;
  lines.forEach((line,li)=>{
    const lr=[];
    let m; re.lastIndex=0;
    while((m=re.exec(line))!==null){
      if(m[1]){
        if(m[2]){ lr.push([m[1],HL.key]); lr.push([m[2],HL.punc]); }
        else lr.push([m[1],HL.str]);
      } else if(m[3]) lr.push([m[3],HL.num]);
      else if(m[4]) lr.push([m[4],HL.kw]);
      else if(m[5]) lr.push([m[5],HL.dim]);
      else lr.push([m[6],HL.punc]);
    }
    if(!lr.length) lr.push([' ',HL.punc]);
    lr.forEach((r,ri)=>{
      const o={color:r[1]};
      if(ri===lr.length-1 && li<lines.length-1) o.breakLine=true;
      runs.push({text:r[0],options:o});
    });
  });
  return runs;
}
function code(s,x,y,w,h,txt,fs){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,fill:{color:CODEBG},rectRadius:0.08,line:{color:CODEBG}});
  s.addText(highlight(txt),{x:x+0.15,y:y+0.1,w:w-0.3,h:h-0.2,fontFace:C,fontSize:fs||10,valign:'top',margin:0,isTextBox:true});
}
function pill(s,x,y,txt,col){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:0.28,h:0.28,fill:{color:col},rectRadius:0.14,line:{color:col}});
}
function rows(s,x,y,w,items,col,dark){
  items.forEach((it,i)=>{
    const yy=y+i*0.78;
    pill(s,x,yy+0.04,'',col);
    s.addText(it[0],{x:x+0.45,y:yy,w:w-0.45,h:0.32,fontFace:B,fontSize:15,bold:true,color:dark?LIGHT:INK,margin:0,isTextBox:true});
    s.addText(it[1],{x:x+0.45,y:yy+0.32,w:w-0.45,h:0.4,fontFace:B,fontSize:12,color:dark?'B8C6D6':MUTED,margin:0,valign:'top',isTextBox:true});
  });
}

// 1 Title
let s=pres.addSlide(); s.background={color:DARK};
s.addText('RFC-8: Collections and Extensibility',{x:0.5,y:1.35,w:5.0,h:1.3,fontFace:H,fontSize:34,bold:true,color:LIGHT,margin:0,valign:'bottom',isTextBox:true});
s.addText('Proposed revisions, Fall 2026',{x:0.5,y:2.75,w:5.0,h:0.45,fontFace:B,fontSize:20,color:ACC,margin:0,isTextBox:true});
s.addText('Traits · URI-based extensions · UUIDs\nMultiscales close to 0.6 · Topics for sub-RFCs',
  {x:0.5,y:3.45,w:5.0,h:0.7,fontFace:B,fontSize:13,color:'B8C6D6',margin:0,valign:'top',isTextBox:true});
// core concepts diagram
const BOX='22324A', EDGE='3A4D68';
const cap=(t,x,y,w)=>s.addText(t,{x,y,w,h:0.22,fontFace:B,fontSize:9,bold:true,charSpacing:1,color:'8A9BB0',margin:0,isTextBox:true});
const mono=(t,x,y,w,c,fs)=>s.addText(t,{x,y,w,h:0.3,fontFace:C,fontSize:fs||10.5,color:c,margin:0,isTextBox:true});
const box=(x,y,w,h,col)=>s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,fill:{color:BOX},rectRadius:0.08,line:{color:col,width:1.25}});
const line=(x1,y1,x2,y2,col)=>s.addShape(pres.shapes.LINE,{x:Math.min(x1,x2),y:Math.min(y1,y2),w:Math.abs(x2-x1)||0.001,h:Math.abs(y2-y1)||0.001,flipH:x2<x1,line:{color:col,width:1.25}});
// node interface
box(6.05,0.75,3.45,0.95,ACC);
cap('NODE INTERFACE',6.25,0.87,3);
mono('type · id · traits',6.25,1.18,3.2,LIGHT);
// implementations
line(6.9,1.7,6.9,2.15,EDGE); line(8.65,1.7,8.65,2.15,EDGE);
box(6.05,2.15,1.65,1.1,ACC);
cap('COLLECTIONS',6.2,2.27,1.5);
mono('collection',6.2,2.55,1.5,'A8E6A3');
mono('nodes: […]',6.2,2.83,1.5,'B8C6D6',9.5);
box(7.85,2.15,1.65,1.1,EDGE);
cap('NODE TYPES',8.0,2.27,1.5);
mono('multiscale',8.0,2.55,1.5,'A8E6A3');
mono('scales: […]',8.0,2.83,1.5,'B8C6D6',9.5);
// extension mechanism
line(6.9,3.25,6.9,3.7,EDGE); line(8.65,3.25,8.65,3.7,EDGE);
box(6.05,3.7,3.45,1.15,MAG);
cap('EXTENSION MECHANISM',6.25,3.82,3);
mono('traits: [{ "type": "https://…" }]',6.25,4.1,3.2,LIGHT,9.5);
mono('extension_manifest',6.25,4.4,3.2,'F28FC5',9.5);

// 2 Traits
s=pres.addSlide(); s.background={color:LIGHT};
title(s,'Traits replace attributes');
s.addText([{text:'Inspired by Rust traits: ',options:{bold:true,color:INK}},{text:'shared behaviour a type opts into and combines freely, instead of inheriting it from a parent type.',options:{color:MUTED}}],{x:0.5,y:5.0,w:9,h:0.3,fontFace:B,fontSize:11,italic:true,margin:0,isTextBox:true});
rows(s,0.5,1.3,4.6,[
  ['Node types are purely structural','Only collection and multiscale. They tell a reader how to traverse the tree.'],
  ['Traits: typed and composable','Subtypes (plate, well, labels) and typed extensions (e.g. rendering). Trait fields sit in the trait.'],
  ['No free-form metadata','Everything beyond the node fields is a typed trait. The attributes catch-all is gone.'],
  ['Trait schemas carry the rules','applies_to, excludes, and constraints on child nodes (plate → wells → multiscales).'],
],ACC);
code(s,5.4,1.3,4.1,3.3,
`{
  "type": "collection",
  "id": "0192f3a0…a1",
  "traits": [
    { "type": "well",
      "row_index": 0,
      "column_index": 0 },
    { "type": "scene",
      "coordinate_systems": [...],
      "coordinate_transformations": [...] }
  ],
  "nodes": [
    { "type": "multiscale",
      "id": "0192f3a0…f0",
      "path": { ... } }
  ]
}`,10);

// 3 Extensions
s=pres.addSlide(); s.background={color:TINT};
title(s,'URI-based extensions with a manifest');
code(s,0.5,1.3,4.6,1.45,
`"extension_manifest": [
  { "id": "https://napari.org/ngff/",
    "version": "1.0",
    "schemas": [{ "type": "json_schema",
                  "url": "https://..." }] }
]`,10);
code(s,0.5,2.95,4.6,1.0,
`"traits": [
  { "type": "https://napari.org/ngff/rendering",
    "contrast_limits": [0, 1500] }
]`,10);
rows(s,5.45,1.3,4.1,[
  ['Declared up front','Readers can list every extension a file uses, with its schema, without a central registry.'],
  ['No name clashes','URIs derived from the extension ID replace prefixes like napari:foo.'],
  ['New node types or traits','Extensions can add node types, or add traits to collections and multiscales. Readers pass unknown traits through.'],
],MAG);

// 3b Type terminology
s=pres.addSlide(); s.background={color:LIGHT};
title(s,'Three tiers of types');
const BLUE='2F6FB5';
const band=(x,w,col,label,sub)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.1,w,h:0.4,fill:{color:col,transparency:85},rectRadius:0.08,line:{color:col,transparency:85}});
  s.addText([{text:label,options:{bold:true,color:INK}},{text:'  '+sub,options:{color:MUTED}}],
    {x:x+0.15,y:1.1,w:w-0.3,h:0.4,fontFace:B,fontSize:12,valign:'middle',margin:0,isTextBox:true});
};
band(0.5,5.95,INK,'Built-in','part of the spec, keyword types like "plate"');
band(6.6,2.9,MAG,'Custom','URI types');
const tiers=[
  [ACC,'MUST','Core types','Every implementation supports them. Without them, OME-Zarr makes no sense.',[['Node type','"collection"'],['Node type','"multiscale"'],['Path format','"relative"']],'essential types, structure / scaffolding'],
  [BLUE,'SHOULD','Recommended types','Part of the spec. Implement when relevant to the application.',[['Node trait','"plate"'],['Node trait','"well"'],['Node trait','"labels"'],['Node trait','"bioformats2raw"']],'core extensions, OME extensions'],
  [MAG,'MAY','Extension types','Defined outside the spec by third parties.',[['Node trait',''],['','"https://napari.org/ngff/rendering"']],'custom types, third-party extensions'],
];
tiers.forEach((t,i)=>{
  const x=0.5+i*3.05, w=2.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.65,w,h:3.6,fill:{color:TINT},rectRadius:0.08,line:{color:'D0D9E3'}});
  s.addText(t[1],{x:x+0.2,y:1.78,w:w-0.4,h:0.45,fontFace:C,fontSize:22,bold:true,color:t[0],margin:0,isTextBox:true});
  s.addText(t[2],{x:x+0.2,y:2.25,w:w-0.4,h:0.35,fontFace:B,fontSize:16,bold:true,color:INK,margin:0,isTextBox:true});
  s.addText(t[3],{x:x+0.2,y:2.62,w:w-0.4,h:0.62,fontFace:B,fontSize:11.5,color:MUTED,margin:0,valign:'top',isTextBox:true});
  const exRuns=[{text:'Examples',options:{fontFace:B,bold:true,color:INK,breakLine:true}}];
  t[4].forEach((e,j)=>{
    const last=j===t[4].length-1;
    if(e[0]) exRuns.push({text:e[0]+(e[1]?' ':''),options:{fontFace:B,color:MUTED,breakLine:!e[1]&&!last}});
    if(e[1]) exRuns.push({text:e[1],options:{fontFace:C,color:INK,breakLine:!last}});
  });
  s.addText(exRuns,{x:x+0.2,y:3.35,w:w-0.4,h:1.15,fontSize:10.5,margin:0,valign:'top',isTextBox:true});
  s.addText([{text:'Alternative terms: ',options:{bold:true}},{text:t[5]}],{x:x+0.2,y:4.62,w:w-0.4,h:0.55,fontFace:B,fontSize:10.5,italic:true,color:MUTED,margin:0,valign:'top',isTextBox:true});
});

// 4 IDs, refs, paths
s=pres.addSlide(); s.background={color:LIGHT};
title(s,'IDs, references and paths');
const hdr={fontFace:B,fontSize:13,bold:true,color:LIGHT,fill:{color:INK},margin:0.08};
const cell=(t,f)=>({text:t,options:{fontFace:f||B,fontSize:f?10:11,color:INK,margin:0.08,valign:'middle'}});
s.addTable([
  [{text:'',options:hdr},{text:'Current RFC-8',options:hdr},{text:'Proposed',options:hdr}],
  [cell('IDs and names'),cell('IDs optional; names required and unique'),cell('IDs required, as UUIDs. Names optional and free-form.')],
  [cell('References'),cell('{"id": "raw"}',C),cell('{"type": "multiscale",\n "ref": "0192f3a0…10"}',C)],
  [cell('Into another document'),cell('{"path": {"type": "zarr",\n   "path": "./raw"},\n "id": "physical"}',C),cell('{"type": "coordinate_system",\n "path": {"type": "zarr",\n   "format": "relative",\n   "href": "./raw"},\n "ref": "0192f3a0…20"}',C)],
  [cell('Paths'),cell('{"type": "zarr", "path": "./raw"}',C),cell('{"type": "zarr", "format": "relative",\n "href": "./raw"}',C)],
  [cell('Path format'),cell('Inferred from the string, e.g. an https:// prefix'),cell('Explicit format: relative, absolute or http')],
  [cell('Multiscales in a collection'),cell('Inlined in our example'),cell('Always a node with a path; never inlined')],
],{x:0.5,y:1.15,w:9,colW:[1.9,3.2,3.9],border:{type:'solid',pt:0.75,color:'D0D9E3'},fill:{color:LIGHT},rowH:[0.35,0.55,0.38,1.05,0.55,0.4,0.4]});
s.addText('A bare ref resolves in the current document; with a path, it resolves in the referenced document. UUIDs are shortened in all examples.',
  {x:0.5,y:5.12,w:9,h:0.3,fontFace:B,fontSize:11,italic:true,color:MUTED,margin:0,isTextBox:true});


// 4c Declarations vs references
s=pres.addSlide(); s.background={color:LIGHT};
title(s,'Declarations and references');
s.addText('Every object is declared once, with a UUID. Everything else points to it by type and ID.',{x:0.5,y:0.98,w:9,h:0.3,fontFace:B,fontSize:13,color:INK,margin:0,isTextBox:true});
s.addText('Declaration',{x:0.5,y:1.35,w:4.3,h:0.28,fontFace:B,fontSize:13,bold:true,color:ACC,margin:0,isTextBox:true});
s.addText('Reference',{x:5.3,y:1.35,w:4.2,h:0.28,fontFace:B,fontSize:13,bold:true,color:MAG,margin:0,isTextBox:true});
code(s,0.5,1.65,4.3,1.45,
`"coordinate_systems": [
  { "id": "0192f3a0…20",
    "name": "physical",
    "axes": [ ... ] } ],
"scales": [
  { "id": "0192f3a0…11",
    "path": { ... } } ]`,9);
code(s,5.3,1.65,4.2,1.45,
`"input": { "type": "scale",
           "ref": "0192f3a0…11" },
"output": { "type": "coordinate_system",
            "ref": "0192f3a0…20" }
// in another document:
"input": { "type": "coordinate_system",
           "path": { "type": "zarr", "href": "./raw" },
           "ref": "0192f3a0…20" }`,8.5);
s.addShape(pres.shapes.LEFT_ARROW,{x:4.86,y:2.2,w:0.38,h:0.34,fill:{color:MAG},line:{color:MAG}});
const dh={fontFace:B,fontSize:11,bold:true,color:LIGHT,fill:{color:INK},margin:0.06};
const dc=(t,f)=>({text:t,options:{fontFace:f||B,fontSize:10.5,color:INK,margin:0.06,valign:'middle'}});
s.addTable([
  [{text:'',options:dh},{text:'Declaration',options:dh},{text:'Reference',options:dh}],
  [dc('Where'),dc('In arrays: nodes, scales, coordinate_systems'),dc('In fields: input, output, source')],
  [dc('"type"'),dc('The object’s own kind, e.g. "multiscale"'),dc('The kind of the target, e.g. "scale"')],
  [dc('Key'),dc('"id" defines a new UUID'),dc('"ref" points to an existing UUID')],
  [dc('Content'),dc('Fields, traits, child nodes'),dc('Only type, ref and an optional path')],
],{x:0.5,y:3.3,w:9,colW:[1.2,3.9,3.9],border:{type:'solid',pt:0.75,color:'D0D9E3'},fill:{color:LIGHT},rowH:[0.32,0.34,0.34,0.34,0.34]});
s.addText([{text:'Prior art: ',options:{bold:true,color:INK}},{text:'OME-XML (…Ref elements), FHIR (reference) and STAC (href) also separate declaration and reference keys.',options:{color:MUTED}}],
  {x:0.5,y:5.1,w:9,h:0.3,fontFace:B,fontSize:11,italic:true,margin:0,isTextBox:true});

// 5 No inlined multiscales
s=pres.addSlide(); s.background={color:TINT};
title(s,'Multiscales: referenced and close to 0.6');
s.addText('Collections reference multiscales by path. Scales replace 0.6 datasets and keep their own transforms.',{x:0.5,y:0.98,w:9,h:0.3,fontFace:B,fontSize:13,color:INK,margin:0,isTextBox:true});
s.addText('collection zarr.json',{x:0.5,y:1.42,w:3.3,h:0.3,fontFace:B,fontSize:12,bold:true,color:MUTED,margin:0,isTextBox:true});
code(s,0.5,1.72,3.3,2.3,
`{ "type": "collection",
  "id": "0192f3a0…e1",
  "nodes": [
    { "type": "multiscale",
      "id": "0192f3a0…10",
      "path": {
        "type": "zarr",
        "format": "relative",
        "href": "./raw" } },
    ... ] }`,9.5);
s.addShape(pres.shapes.RIGHT_ARROW,{x:3.9,y:2.67,w:0.5,h:0.4,fill:{color:ACC},line:{color:ACC}});
s.addText('raw/zarr.json',{x:4.5,y:1.42,w:5.0,h:0.3,fontFace:B,fontSize:12,bold:true,color:MUTED,margin:0,isTextBox:true});
code(s,4.5,1.72,5.0,2.55,
`{ "type": "multiscale",
  "id": "0192f3a0…10",
  "coordinate_systems": [
    { "id": "0192f3a0…20", "axes": [ ... ] } ],
  "scales": [
    { "id": "0192f3a0…11",
      "path": { "type": "zarr",
        "format": "relative", "href": "./s0" },
      "coordinate_transformations": [
        { "type": "scale", "scale": [ ... ],
          "input": { "type": "scale", "ref": "0192f3a0…11" },
          "output": { "type": "coordinate_system",
                      "ref": "0192f3a0…20" } } ] },
    { "id": "0192f3a0…12", ... } ],
  "traits": [ ... ] }`,9);
const pts=[
  ['Close to 0.6','Scales replace 0.6 datasets. The singlescale node type is removed.'],
  ['Transforms per scale','Each scale maps itself into the coordinate system, as in 0.6.'],
  ['One source of truth','No inline copy that can drift from the image.'],
];
pts.forEach((p,i)=>{
  const y=4.3, x=0.5+i*3.1;
  pill(s,x,y+0.04,'',ACC);
  s.addText(p[0],{x:x+0.4,y,w:2.6,h:0.28,fontFace:B,fontSize:13,bold:true,color:INK,margin:0,isTextBox:true});
  s.addText(p[1],{x:x+0.4,y:y+0.3,w:2.6,h:0.5,fontFace:B,fontSize:10.5,color:MUTED,margin:0,valign:'top',isTextBox:true});
});

// 6 Consolidated metadata
s=pres.addSlide(); s.background={color:LIGHT};
title(s,'Consolidated metadata for fast IO');
s.addText('plate/zarr.json',{x:0.5,y:1.1,w:5.9,h:0.3,fontFace:B,fontSize:12,bold:true,color:MUTED,margin:0,isTextBox:true});
code(s,0.5,1.4,5.9,3.25,
`{ "zarr_format": 3, "node_type": "group",
  "attributes": { "ome": {
    "type": "collection", "id": "0192f3a0…c0",
    "traits": [{ "type": "plate", ... }],
    "nodes": [
      { "type": "collection", "id": "0192f3a0…a1",
        "path": { "type": "zarr", "href": "./A/1" } } ] } },
  "consolidated_metadata": {
    "kind": "inline", "must_understand": false,
    "metadata": {
      "A/1": { "node_type": "group",
        "attributes": { "ome": {
          "type": "collection", "id": "0192f3a0…a1",
          "traits": [{ "type": "well", "row_index": 0,
                      "column_index": 0 }],
          "nodes": [
            { "type": "multiscale", "id": "0192f3a0…f0",
              "path": { "type": "zarr", "href": "./0" } } ] } } },
      "A/1/0": { "node_type": "group",
        "attributes": { "ome": { "type": "multiscale", ... } } },
      "A/1/0/s0": { "node_type": "array", ... } } } }`,8.5);
const cpts=[
  ['Collections stay separate','The well is its own document, referenced by path.'],
  ['One request loads the tree','The root carries copies of all child zarr.json files.'],
  ['Files stay the truth','zarr.json files are authoritative; the copy is a cache and can go stale.'],
  ['Pure Zarr, no OME rules','Readers without support fetch each node.'],
];
s.addText([
  {text:'Note: ',options:{bold:true,color:INK}},
  {text:'the Zarr-level specification of consolidated metadata is currently incomplete. Keeping the cache consistent with the individual files would require an external transaction system, such as Icechunk or a custom database.',options:{color:MUTED}}
],{x:0.5,y:4.95,w:9,h:0.5,fontFace:B,fontSize:11,valign:'top',italic:true,margin:0,isTextBox:true});
cpts.forEach((p,i)=>{
  const yy=1.45+i*0.88;
  pill(s,6.7,yy+0.04,'',ACC);
  s.addText(p[0],{x:7.1,y:yy,w:2.4,h:0.35,fontFace:B,fontSize:14,bold:true,color:INK,margin:0,valign:'top',isTextBox:true});
  s.addText(p[1],{x:7.1,y:yy+0.34,w:2.4,h:0.5,fontFace:B,fontSize:11,color:MUTED,margin:0,valign:'top',isTextBox:true});
});

// 8 Deferred topics
s=pres.addSlide(); s.background={color:DARK};
title(s,'Deferred to future sub-RFCs',true);
const dts=[
  ['HCS','Plate and well traits.'],
  ['Labels','Label image traits and per-label properties.'],
  ['bioformats2raw and OME-XML','Series layout and the OME/METADATA.ome.xml mapping.'],
  ['Absolute and remote references','Absolute paths and URLs, authentication, and security.'],
  ['snake_case','Making keys and identifiers consistent with Zarr.'],
  ['Legacy multiscales','A legacy_multiscale node type for unchanged 0.5 and 0.6 images.'],
];
dts.forEach((q,i)=>{
  const yy=1.15+i*0.7;
  s.addShape(pres.shapes.OVAL,{x:0.5,y:yy+0.06,w:0.44,h:0.44,fill:{color:MAG},line:{color:MAG}});
  s.addText(String(i+1),{x:0.5,y:yy+0.06,w:0.44,h:0.44,fontFace:B,fontSize:14,bold:true,color:LIGHT,align:'center',valign:'middle',margin:0,isTextBox:true});
  s.addText(q[0],{x:1.2,y:yy,w:8.3,h:0.32,fontFace:B,fontSize:16,bold:true,color:LIGHT,margin:0,isTextBox:true});
  s.addText(q[1],{x:1.2,y:yy+0.33,w:8.3,h:0.3,fontFace:B,fontSize:12.5,color:'B8C6D6',margin:0,valign:'top',isTextBox:true});
});

// 5b Legacy multiscale
s=pres.addSlide(); s.background={color:TINT};
title(s,'Legacy multiscales from 0.5 and 0.6');
s.addText('For a future sub-RFC: a legacy_multiscale node type mounts an existing 0.5 or 0.6 image without converting it.',{x:0.5,y:0.98,w:9,h:0.3,fontFace:B,fontSize:13,color:INK,margin:0,isTextBox:true});
s.addText('collection zarr.json',{x:0.5,y:1.42,w:4.0,h:0.3,fontFace:B,fontSize:12,bold:true,color:MUTED,margin:0,isTextBox:true});
code(s,0.5,1.72,4.0,1.5,
`{ "type": "legacy_multiscale",
  "id": "0192f3a0…5c",
  "path": { "type": "zarr",
            "format": "relative",
            "href": "./scan_2023" },
  "traits": [ ... ] }`,10);
s.addShape(pres.shapes.RIGHT_ARROW,{x:4.6,y:2.27,w:0.55,h:0.4,fill:{color:ACC},line:{color:ACC}});
s.addText('scan_2023/zarr.json (unchanged)',{x:5.25,y:1.42,w:4.25,h:0.3,fontFace:B,fontSize:12,bold:true,color:MUTED,margin:0,isTextBox:true});
code(s,5.25,1.72,4.25,1.5,
`{ "ome": {
    "version": "0.6",
    "multiscales": [{
      "coordinateSystems": [ ... ],
      "datasets": [ ... ] }],
    "omero": { ... } } }`,10);
const lpts=[
  ['Existing data, untouched','0.5 and 0.6 images join a collection without rewriting, including omero and OME/METADATA.ome.xml.'],
  ['Read by its own spec','The target is read with the rules of its own version. Traits on the declaring node add to it.'],
  ['References by name','Coordinate systems inside the legacy image are addressed by name in 0.6, or as the implicit one in 0.5.'],
];
lpts.forEach((p,i)=>{
  const x=0.5+i*3.1;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:3.4,w:2.9,h:1.75,fill:{color:LIGHT},rectRadius:0.08,line:{color:'D0D9E3'}});
  pill(s,x+0.2,3.6,'',ACC);
  s.addText(p[0],{x:x+0.6,y:3.55,w:2.2,h:0.4,fontFace:B,fontSize:14,bold:true,color:INK,margin:0,valign:'middle',isTextBox:true});
  s.addText(p[1],{x:x+0.2,y:4.05,w:2.5,h:1.0,fontFace:B,fontSize:12,color:MUTED,margin:0,valign:'top',isTextBox:true});
});

pres.writeFile({fileName:'rfc8_revisions.pptx'}).then(()=>console.log('ok'));
