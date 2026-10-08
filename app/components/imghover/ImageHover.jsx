"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";



function getResponsiveWebGLWidth(container) {
  const width = container?.clientWidth || 400;

  if (width <= 400) {
    return 640;
  }

  if (width <= 600) {
    return 640;
  }

  if (width <= 750) {
    return 750;
  }

  if (width <= 900) {
    return 828;
  }

  if (width <= 1200) {
    return 1200;
  }

  return 1920;
}



function normalizeUrl(url) {
  if (!url) return url;
  if (
    !url.startsWith("/") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("data:")
  ) {
    return "/" + url;
  }
  return url;
}




function getOptimizedWebGLUrl(src, maxWidth) {
  if (!src) return src;

  if (src.includes("/_next/image")) {
    try {
      const url = new URL(src, window.location.origin);

      url.searchParams.set("w", String(maxWidth));

      return url.toString();
    } catch {
      return src;
    }
  }

  return src;
}




export function initDisplacementEffect(container, options = {}) {
  if (
    !container ||
    container.getAttribute("data-displaced-init") === "true"
  ) {
    return null;
  }

  container.setAttribute("data-displaced-init", "true");

  const imgEl = container.querySelector("img");

  const imgSrc =
    imgEl?.currentSrc ||
    imgEl?.src ||
    options.image1 ||
    null;

  const hoverSrc =
    options.image2 ||
    imgSrc;

  const displacementSrc =
    options.displacementImage ||
    container.getAttribute("data-displacement") ||
    "/assets/img/imghover/stripe-mul.png";

  let progress = 0;
  let targetProgress = 0;
  let isAnimating = false;
  let animationFrame = null;



  const intensity =
    options.intensity !== undefined
      ? options.intensity
      : parseFloat(
        container.getAttribute("data-intensity")
      ) || 0.2;

  const speedIn =
    options.speedIn !== undefined
      ? options.speedIn
      : parseFloat(
        container.getAttribute("data-speedin")
      ) || 1.0;

  const speedOut =
    options.speedOut !== undefined
      ? options.speedOut
      : parseFloat(
        container.getAttribute("data-speedout")
      ) || 1.0;


  if (!imgSrc) {
    container.removeAttribute("data-displaced-init");
    return null;
  }



  const style = window.getComputedStyle(container);

  if (style.position === "static") {
    container.style.position = "relative";
  }

  container.style.overflow = "hidden";




  const canvas = document.createElement("canvas");

  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.borderRadius =
    style.borderRadius || "inherit";

  container.appendChild(canvas);



  const gl =
    canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    }) ||
    canvas.getContext("experimental-webgl");


  if (!gl) {
    if (imgEl) {
      imgEl.style.opacity = "1";
      imgEl.style.visibility = "visible";
    }

    container.removeAttribute("data-displaced-init");

    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }

    return null;
  }



  const vertShaderSrc = `
    attribute vec2 a_position;

    varying vec2 v_uv;

    void main() {

      v_uv = a_position * 0.5 + 0.5;

      v_uv.y = 1.0 - v_uv.y;

      gl_Position = vec4(
        a_position,
        0.0,
        1.0
      );
    }
  `;


  const fragShaderSrc = `
    precision highp float;

    varying vec2 v_uv;

    uniform sampler2D u_image1;
    uniform sampler2D u_image2;
    uniform sampler2D u_displacement;

    uniform float u_progress;
    uniform float u_intensity;

    uniform vec4 u_res;

    void main() {

      vec2 uv =
        (v_uv - vec2(0.5))
        * u_res.zw
        + vec2(0.5);

      vec4 disp =
        texture2D(
          u_displacement,
          uv
        );

      float dispFactor =
        disp.r * u_intensity;

      vec2 dist1 =
        vec2(
          uv.x +
          u_progress *
          dispFactor,
          uv.y
        );

      vec2 dist2 =
        vec2(
          uv.x -
          (1.0 - u_progress) *
          dispFactor,
          uv.y
        );

      dist1 =
        clamp(
          dist1,
          0.0,
          1.0
        );

      dist2 =
        clamp(
          dist2,
          0.0,
          1.0
        );

      vec4 color1 =
        texture2D(
          u_image1,
          dist1
        );

      vec4 color2 =
        texture2D(
          u_image2,
          dist2
        );

      gl_FragColor =
        mix(
          color1,
          color2,
          u_progress
        );
    }
  `;

  function createShader(type, source) {
    const shader =
      gl.createShader(type);

    if (!shader) {
      return null;
    }

    gl.shaderSource(
      shader,
      source
    );

    gl.compileShader(shader);


    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
      )
    ) {
      console.error(
        "Shader compile error:",
        gl.getShaderInfoLog(shader)
      );

      gl.deleteShader(shader);

      return null;
    }

    return shader;
  }


  /* =========================================================
     CREATE PROGRAM
  ========================================================= */

  const vertShader =
    createShader(
      gl.VERTEX_SHADER,
      vertShaderSrc
    );

  const fragShader =
    createShader(
      gl.FRAGMENT_SHADER,
      fragShaderSrc
    );


  if (!vertShader || !fragShader) {
    if (imgEl) {
      imgEl.style.opacity = "1";
      imgEl.style.visibility = "visible";
    }

    return null;
  }


  const program =
    gl.createProgram();


  if (!program) {
    return null;
  }


  gl.attachShader(
    program,
    vertShader
  );

  gl.attachShader(
    program,
    fragShader
  );

  gl.linkProgram(program);


  if (
    !gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    )
  ) {
    console.error(
      "Program link error:",
      gl.getProgramInfoLog(program)
    );

    gl.deleteProgram(program);

    return null;
  }


  gl.useProgram(program);


  /* =========================================================
     POSITION BUFFER
  ========================================================= */

  const positionBuffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,

      -1, 1,
      1, -1,
      1, 1,
    ]),
    gl.STATIC_DRAW
  );


  const aPosition =
    gl.getAttribLocation(
      program,
      "a_position"
    );

  gl.enableVertexAttribArray(
    aPosition
  );

  gl.vertexAttribPointer(
    aPosition,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );


  /* =========================================================
     UNIFORMS
  ========================================================= */

  const uImage1Loc =
    gl.getUniformLocation(
      program,
      "u_image1"
    );

  const uImage2Loc =
    gl.getUniformLocation(
      program,
      "u_image2"
    );

  const uDispLoc =
    gl.getUniformLocation(
      program,
      "u_displacement"
    );

  const uProgressLoc =
    gl.getUniformLocation(
      program,
      "u_progress"
    );

  const uIntensityLoc =
    gl.getUniformLocation(
      program,
      "u_intensity"
    );

  const uResLoc =
    gl.getUniformLocation(
      program,
      "u_res"
    );


  /* =========================================================
     TEXTURE LOADER
  ========================================================= */

  function loadTexture(src, textureUnit) {
    return new Promise((resolve) => {

      const texture =
        gl.createTexture();

      const img =
        typeof window !== "undefined" &&
          window.Image
          ? new window.Image()
          : new Image();


      img.crossOrigin = "anonymous";


      img.onload = () => {

        gl.activeTexture(
          gl.TEXTURE0 +
          textureUnit
        );

        gl.bindTexture(
          gl.TEXTURE_2D,
          texture
        );


        gl.pixelStorei(
          gl.UNPACK_FLIP_Y_WEBGL,
          false
        );


        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );


        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR
        );

        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MAG_FILTER,
          gl.LINEAR
        );


        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_S,
          gl.CLAMP_TO_EDGE
        );

        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          gl.CLAMP_TO_EDGE
        );


        resolve({
          texture,
          img,
        });
      };


      img.onerror = () => {

        console.error(
          "Failed to load WebGL image:",
          src
        );

        resolve(null);
      };


      /* =====================================================
         RESPONSIVE IMAGE WIDTH
      ===================================================== */

      const responsiveWidth =
        getResponsiveWebGLWidth(
          container
        );


      img.src =
        getOptimizedWebGLUrl(
          normalizeUrl(src),
          responsiveWidth
        );

    });
  }


  /* =========================================================
     LOAD ALL TEXTURES
  ========================================================= */

  let textures = null;

  Promise.all([
    loadTexture(
      imgSrc,
      0
    ),

    loadTexture(
      hoverSrc || imgSrc,
      1
    ),

    loadTexture(
      displacementSrc,
      2
    ),
  ]).then((results) => {

    if (
      !results ||
      results.some(
        (result) => !result
      )
    ) {
      if (imgEl) {
        imgEl.style.opacity = "1";
        imgEl.style.visibility = "visible";
      }
      return;
    }


    textures = results;

    if (imgEl) {
      imgEl.style.opacity = "0";
      imgEl.style.visibility = "hidden";
    }


    gl.useProgram(program);


    /* IMAGE 1 */

    gl.activeTexture(
      gl.TEXTURE0
    );

    gl.bindTexture(
      gl.TEXTURE_2D,
      textures[0].texture
    );

    gl.uniform1i(
      uImage1Loc,
      0
    );


    /* IMAGE 2 */

    gl.activeTexture(
      gl.TEXTURE1
    );

    gl.bindTexture(
      gl.TEXTURE_2D,
      textures[1].texture
    );

    gl.uniform1i(
      uImage2Loc,
      1
    );


    /* DISPLACEMENT */

    gl.activeTexture(
      gl.TEXTURE2
    );

    gl.bindTexture(
      gl.TEXTURE_2D,
      textures[2].texture
    );

    gl.uniform1i(
      uDispLoc,
      2
    );


    gl.uniform1f(
      uIntensityLoc,
      intensity
    );

    updateResolution();
    drawFrame();

    if (container.matches(":hover")) {
      handleMouseEnter();
    }
  });


  /* =========================================================
     RESOLUTION & DRAW
  ========================================================= */

  function updateResolution() {
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);

    if (uResLoc) {
      const canvasAspect = width / height;
      const imageAspect =
        imgEl?.naturalWidth && imgEl?.naturalHeight
          ? imgEl.naturalWidth / imgEl.naturalHeight
          : canvasAspect;

      let scaleX = 1;
      let scaleY = 1;

      if (canvasAspect > imageAspect) {
        scaleY = imageAspect / canvasAspect;
      } else {
        scaleX = canvasAspect / imageAspect;
      }

      gl.useProgram(program);
      gl.uniform4f(uResLoc, width, height, scaleX, scaleY);
    }
    drawFrame();
  }

  function drawFrame() {
    if (!textures) return;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(uProgressLoc, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function render() {
    if (!textures) {
      isAnimating = false;
      return;
    }

    const diff = targetProgress - progress;
    if (Math.abs(diff) < 0.002) {
      progress = targetProgress;
      drawFrame();
      isAnimating = false;
      return;
    }

    const speed = targetProgress > progress ? speedIn : speedOut;
    progress += diff * Math.min(0.08 * speed, 1);

    drawFrame();

    animationFrame = requestAnimationFrame(render);
  }

  function startRender() {
    if (!isAnimating) {
      isAnimating = true;
      animationFrame = requestAnimationFrame(render);
    }
  }

  /* =========================================================
     MOUSE
  ========================================================= */

  function handleMouseEnter() {
    targetProgress = 1;
    startRender();
  }

  function handleMouseLeave() {
    targetProgress = 0;
    startRender();
  }

  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("resize", updateResolution);


  /* =========================================================
     CLEANUP
  ========================================================= */

  return () => {

    cancelAnimationFrame(
      animationFrame
    );


    container.removeEventListener(
      "mouseenter",
      handleMouseEnter
    );


    container.removeEventListener(
      "mouseleave",
      handleMouseLeave
    );


    window.removeEventListener(
      "resize",
      updateResolution
    );


    if (canvas.parentNode) {
      canvas.parentNode.removeChild(
        canvas
      );
    }


    if (program) {
      gl.deleteProgram(
        program
      );
    }


    if (vertShader) {
      gl.deleteShader(
        vertShader
      );
    }


    if (fragShader) {
      gl.deleteShader(
        fragShader
      );
    }


    if (positionBuffer) {
      gl.deleteBuffer(
        positionBuffer
      );
    }


    if (textures) {
      textures.forEach(
        (item) => {

          if (item?.texture) {
            gl.deleteTexture(
              item.texture
            );
          }

        }
      );
    }


    if (imgEl) {
      imgEl.style.opacity = "1";
      imgEl.style.visibility = "visible";
    }


    container.removeAttribute(
      "data-displaced-init"
    );
  };
}


/* =========================================================
   DISPLACEMENT HOVER IMAGE COMPONENT
========================================================= */

export function DisplacementHoverImage({
  src,
  hoverSrc,
  displacement =
  "/assets/img/imghover/stripe-mul.png",
  intensity = 0.2,
  speedIn = 1.0,
  speedOut = 1.0,
  className = "",
  alt = "",
  style = {},
  sizes =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  children,
  ...props
}) {

  const containerRef =
    useRef(null);


  useEffect(() => {
    // On touch devices, hover displacement is never triggered; skip WebGL setup
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let cleanup = null;
    const el = containerRef.current;

    const handlePointerEnter = () => {
      if (!cleanup && el) {
        cleanup = initDisplacementEffect(el, {
          image1: src,
          image2: hoverSrc || src,
          displacementImage: displacement,
          intensity,
          speedIn,
          speedOut,
        });
      }
    };

    el.addEventListener("pointerenter", handlePointerEnter, { once: true, passive: true });

    return () => {
      if (el) {
        el.removeEventListener("pointerenter", handlePointerEnter);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [
    src,
    hoverSrc,
    displacement,
    intensity,
    speedIn,
    speedOut,
  ]);


  return (
    <div
      ref={containerRef}
      className={`tp--hover-img relative overflow-hidden block w-full h-full ${className}`}
      style={{ ...style }}
      {...props}
    >

      <Image quality={100}
        src={src}
        alt={alt || ""}
        fill
        sizes={sizes}
        className="w-full h-full object-cover block"
      />

      {children}

    </div>
  );
}


/* =========================================================
   AUTO INIT
========================================================= */

export function DisplacementHoverAutoInit() {
  useEffect(() => {
    // Disable WebGL hover effects completely on touch/mobile devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cleanups = [];

    const handleElementHover = (e) => {
      const el = e.currentTarget;
      if (!el.getAttribute("data-displaced-init")) {
        const cleanup = initDisplacementEffect(el);
        if (cleanup) cleanups.push(cleanup);
      }
    };

    // Lazy attach on idle to prevent blocking initial thread
    const attachListeners = () => {
      const elements = document.querySelectorAll(".tp--hover-img, [data-displacement]");
      elements.forEach((el) => {
        el.addEventListener("pointerenter", handleElementHover, { once: true, passive: true });
      });
    };

    let idleId;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(attachListeners, { timeout: 3000 });
    } else {
      const timer = setTimeout(attachListeners, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default function ImgHoverPage() {
  return null;
}