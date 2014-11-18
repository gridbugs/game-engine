precision mediump float;

varying vec2 v_tex_coord;

uniform vec4 u_colour;

uniform int u_has_texture;
uniform vec2 u_tex_size;

uniform int u_pixelate;
uniform float u_pixel_size;
uniform float u_pixel_fade;

uniform int u_blur;
uniform int u_blur_radius;
#define MAX_BLUR_RADIUS 1000

uniform sampler2D u_image;

uniform float u_opacity;

uniform bool u_is_light;
uniform vec2 u_light_pos;
uniform float u_light_radius;
uniform vec4 u_light_colour;

uniform vec2 u_resolution;
uniform float u_flip_y;

void main() {
    if (u_has_texture == 1) {

        vec2 screen_coord = v_tex_coord * u_tex_size;
        vec2 pixel_size = vec2(1,1)/u_tex_size;

        if (u_pixelate == 1) {
            
            vec2 virtual_pixel_size = vec2(1, 1)/(u_tex_size/u_pixel_size);
            vec2 test = v_tex_coord - mod(v_tex_coord, virtual_pixel_size);
            vec4 colour = texture2D(u_image, test);
            gl_FragColor = colour;
        } else if (u_blur == 1) {
            vec4 sum = vec4(0,0,0,0);
            for (int i = 0;i<MAX_BLUR_RADIUS;++i) {
                int _i = i - u_blur_radius;
                if (_i >= u_blur_radius) {
                    break;
                }
                for (int j = 0;j<MAX_BLUR_RADIUS;++j) {
                    int _j = j - u_blur_radius;
                    if (_j >= u_blur_radius) {
                        break;
                    }
                    sum += texture2D(u_image, (screen_coord + vec2(_i, _j))*pixel_size );
                }
            }
            gl_FragColor = sum/float(u_blur_radius*u_blur_radius*4);
        } else if (u_is_light) {
            vec2 pos;
            if (u_flip_y == 1.0) {
                pos = vec2(gl_FragCoord[0], gl_FragCoord[1]);
            } else {
                pos = vec2(gl_FragCoord[0], u_resolution[1]-gl_FragCoord[1]);
            }
            vec4 colour = texture2D(u_image, screen_coord / u_tex_size) * u_opacity;
            float dist_to_light = distance(pos, u_light_pos);
            float light_dist_mult = 1.0 - min(1.0, dist_to_light / u_light_radius);
            colour[3] *= (light_dist_mult * light_dist_mult);
            gl_FragColor = colour * u_light_colour;
            
        } else {
            vec4 colour = texture2D(u_image, screen_coord / u_tex_size)*u_opacity;
            if (colour[3] == 0.0) {
                gl_FragColor = colour;
            } else {
                gl_FragColor = colour;
            }
        }
    
    } else {
        gl_FragColor = u_colour * u_opacity;
    }
}
