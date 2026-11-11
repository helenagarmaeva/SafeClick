"""Add reversible twist/close animation without modifying the source model geometry."""
from pathlib import Path
import json,struct,math
root=Path(__file__).resolve().parents[1]
source=(root/'assets/metal-capsule.glb').read_bytes()
jlen=struct.unpack_from('<I',source,12)[0]
doc=json.loads(source[20:20+jlen])
bstart=20+jlen
blen,btype=struct.unpack_from('<II',source,bstart)
binary=bytearray(source[bstart+8:bstart+8+blen])
def accessor(values,kind,count,minimum=None,maximum=None):
 while len(binary)%4:binary.append(0)
 offset=len(binary);binary.extend(struct.pack('<'+'f'*len(values),*values))
 view=len(doc.setdefault('bufferViews',[]));doc['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(values)*4})
 item={'bufferView':view,'componentType':5126,'count':count,'type':kind}
 if minimum is not None:item.update(min=minimum,max=maximum)
 index=len(doc.setdefault('accessors',[]));doc['accessors'].append(item);return index
# Angles align the printed glyph centers with the stationary sleeve mark.
mark_angle=math.degrees(math.atan2(.01329,-.00042))
locked_angle=mark_angle-118.82810458
unlocked_angle=mark_angle-56.95310820
def quaternion(angle):
 a=math.radians(angle)/2
 return [math.sin(a),0,0,math.cos(a)]
clock=accessor([0,1,2,3,4,4.1],'SCALAR',6,[0],[4.1])
rotation=accessor(sum([quaternion(a) for a in [locked_angle,locked_angle,unlocked_angle,unlocked_angle,locked_angle,locked_angle]],[]),'VEC4',6)
close=accessor([0,0,0,0,0,0,0,0,0,.00183,0,0,0,0,0,0,0,0],'VEC3',6)
anim={'name':'Device workflow','samplers':[],'channels':[]}
def channel(node,path,output):
 i=len(anim['samplers']);anim['samplers'].append({'input':clock,'output':output,'interpolation':'LINEAR'});anim['channels'].append({'sampler':i,'target':{'node':node,'path':path}})
for node in [4,6]:channel(node,'rotation',rotation);channel(node,'translation',close)
doc['animations']=[anim];doc['buffers'][0]['byteLength']=len(binary)
encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
binary+=b'\0'*((-len(binary))%4)
result=struct.pack('<4sII',b'glTF',2,12+8+len(encoded)+8+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
(root/'assets/metal-capsule-workflow.glb').write_bytes(result)
print('Animated GLB:',len(result),'bytes; aligned lock glyphs; front closure 1.83 mm; rear cap fixed')
