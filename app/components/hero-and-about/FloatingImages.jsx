"use client";

import React, { memo } from "react";
import { CldImage } from "next-cloudinary";

const FloatingImages = memo(() => {
    const images = [
        { src: "SAP", width: 60, height: 60, top: "15%", left: "10%", type: "up" },
        { src: "cloud-mobility", width: 80, height: 80, top: "20%", left: "75%", type: "down" },
        { src: "mobile-application", width: 50, height: 50, top: "65%", left: "5%", type: "down" },
        { src: "SAP", width: 70, height: 70, top: "75%", left: "80%", type: "up" },
        { src: "cloud-mobility", width: 55, height: 55, top: "45%", left: "88%", type: "up" },
        { src: "mobile-application", width: 75, height: 75, top: "50%", left: "15%", type: "down" },
        { src: "SAP", width: 70, height: 70, top: "10%", left: "45%", type: "down" },
        { src: "cloud-mobility", width: 60, height: 60, top: "85%", left: "50%", type: "up" },
    ];

    return (
        <div className="absolute inset-0 z-[32] pointer-events-none overflow-hidden opacity-0 invisible floating-images-wrapper">
            {images.map((img, i) => (
                <div
                    key={i}
                    className={`absolute  overflow-hidden  opacity-20 will-change-transform floating-img-${img.type}`}
                    style={{
                        top: img.top,
                        left: img.left,
                        width: img.width,
                        height: img.height,
                    }}
                >
                    <CldImage
                        src={img.src}
                        alt="floating background image"
                        fill
                        sizes={`${img.width}px`}
                        className="object-cover"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
});

FloatingImages.displayName = "FloatingImages";
export default FloatingImages;
