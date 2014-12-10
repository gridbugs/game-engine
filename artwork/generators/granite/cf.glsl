precision mediump float;

varying vec2 v_tex_coord;

uniform vec4 u_colour;

uniform int u_has_texture;
uniform vec2 u_tex_size;

uniform int u_pixelate;
uniform int u_pixel_size;
uniform float u_pixel_fade;
#define MAX_PIXEL_SIZE 10

uniform int u_blur;
const int u_blur_radius = 1;
#define MAX_BLUR_RADIUS 1000

uniform sampler2D u_image;

uniform float u_opacity;

uniform bool u_is_light;
uniform vec2 u_light_pos;
uniform float u_light_radius;
uniform vec4 u_light_colour;

uniform vec2 u_resolution;
uniform float u_flip_y;

uniform vec2 u_tex_zoom;

uniform vec2 u_dot_pos;
uniform vec4 u_dot_col;
uniform float u_dot_rad;

uniform float u_darken;

uniform float u_top;
uniform float u_bottom;
uniform float u_left;
uniform float u_right;

uniform bool u_capturing;

float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

const float border = 2.0;

void main() {
    if (u_has_texture == 1) {

        vec2 screen_coord = v_tex_coord;
        vec4 colour = texture2D(u_image, screen_coord / u_tex_zoom);

        if (colour[0] == 0.0) {
            gl_FragColor = vec4(1,0,0,1);
        } else {
            gl_FragColor = colour;
        }

    } else {
        vec2 pt = vec2(gl_FragCoord);
        
        if (u_capturing) {
            pt[1] = u_resolution[1]-pt[1];
        }

        float a = rand(pt*0.01)*0.2+0.1;
        float mult = 1.0;
        if (pt[0] < u_left + border) {
            mult*= (1.0-(u_left + border - pt[0])/(border));
        }
        if (pt[0] > u_right - border) {
            mult*= (1.0-(pt[0]-(u_right - border))/border);
        }

        if (pt[1] > u_top - border) {
            mult*= (1.0-(pt[1]-(u_top - border))/border);
        }

        if (pt[1] < u_bottom + border) {
            mult*= (1.0-(u_bottom + border - pt[1])/(border));
        }

        a*=mult;
        gl_FragColor = vec4(a,a,a,1);
    }
}
