precision mediump float;

varying vec2 v_tex_coord;
varying vec2 v_normal_map_coord;

uniform sampler2D u_texture;
uniform sampler2D u_normal_map;

uniform vec2 u_mouse;

uniform vec2 u_resolution;

const float eye_height = 50.0;
vec3 eye_pos = vec3(u_resolution/2.0, eye_height);

const float light_height = 100.0;

const float ambient = 0.15;

vec3 refl(vec3 norm, vec3 to_light) {
    return 2.0*(dot(to_light, norm))*norm - to_light;
}

void main() {

    vec3 pos = vec3(vec2(gl_FragCoord), 0);

    vec4 tex_pix = texture2D(u_texture, fract(v_tex_coord));
    vec4 normal_map_pix = texture2D(u_normal_map, fract(v_normal_map_coord));

    vec3 light_pos = vec3(u_mouse, light_height);

    vec3 normal = normalize(2.0 * (vec3(normal_map_pix) - vec3(0.5, 0.5, 0.5)));

    vec3 to_light = normalize(light_pos - pos);

    float diffuse = dot(to_light, normal);

    vec3 reflection = normalize(refl(normal, to_light));

    vec3 to_eye = normalize(eye_pos - pos);

    float specular = pow(dot(reflection, to_eye), 100.0);

    vec4 lit_pix = tex_pix * (ambient + 0.8*diffuse + 0.5*specular) +0.0* vec4(specular, specular, specular, 1);

    lit_pix[3] = 1.0;
    gl_FragColor = lit_pix;
}
