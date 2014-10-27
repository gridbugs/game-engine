precision mediump float;

varying vec2 v_tex_coord;

uniform vec4 u_colour;

uniform int u_has_texture;
uniform vec2 u_tex_size;

uniform int u_pixelate;
uniform int u_pixel_size;
uniform float u_pixel_fade;

uniform int u_blur;
uniform int u_blur_radius;
#define MAX_BLUR_RADIUS 1000

uniform sampler2D u_image;

void main() {
    if (u_has_texture == 1) {

        vec2 screen_coord = v_tex_coord * u_tex_size;
        vec2 pixel_size = vec2(1,1)/u_tex_size;

        if (u_pixelate == 1) {
            float pixel = float(u_pixel_size);
            vec2 inside_pix = vec2(mod(screen_coord[0], pixel), mod(screen_coord[1], pixel));
            vec4 overlay = vec4(0,0,0,0);
            float darken = 0.0;
            darken = (max(inside_pix[0], inside_pix[1])/pixel)*u_pixel_fade;
            overlay += vec4(darken, darken, darken, 0);
                
            screen_coord = vec2(
                u_pixel_size*(int(screen_coord[0])/u_pixel_size),
                u_pixel_size*(int(screen_coord[1])/u_pixel_size)
            );

            vec4 pix = texture2D(u_image, screen_coord*pixel_size);
            if (pix[0] < 1.0 || pix[1] < 1.0 || pix[2] < 1.0) {
                pix -= overlay;
            }

            gl_FragColor = pix;
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
        } else {
            gl_FragColor = texture2D(u_image, screen_coord / u_tex_size);
        }
    
    } else {
        gl_FragColor = u_colour;
    }
}
