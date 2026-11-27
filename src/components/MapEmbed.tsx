'use client';

import { useState } from 'react';

/**
 * Google Maps loads about a megabyte of scripts, so the map only loads when someone taps it.
 * Until then a light placeholder shows the address and a "Show map" button.
 */
export default function MapEmbed({
  src,
  title,
  address,
  label,
}: {
  src: string;
  title: string;
  address: string;
  label: string;
}) {
  const [show, setShow] = useState(false);
  if (show) {
    return (
      <iframe src={src} title={title} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
    );
  }
  return (
    <button type="button" className="map__placeholder" onClick={() => setShow(true)}>
      <span className="map__pin" aria-hidden="true" />
      <span className="map__addr">{address}</span>
      <span className="btn btn--primary map__show">{label}</span>
    </button>
  );
}
