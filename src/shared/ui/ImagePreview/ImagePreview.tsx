import type { ReactNode } from "react";
import styles from "./ImagePreview.module.css";

type ImagePreviewProps = {
  /** Object URL. Creating and revoking it belongs to whoever owns the
   *  value, not to this display. */
  url: string;
  file: File;
  action?: ReactNode;
};

function formatSize(bytes: number): string {
  const kilobytes = bytes / 1024;
  return kilobytes < 1024
    ? `${Math.round(kilobytes)} Ko`
    : `${(kilobytes / 1024).toFixed(1)} Mo`;
}

/** Local preview of a chosen image, before any upload. */
export function ImagePreview({ url, file, action }: ImagePreviewProps) {
  return (
    <figure className={styles.root}>
      <img className={styles.image} src={url} alt={`Aperçu de ${file.name}`} />

      <figcaption className={styles.caption}>
        <span className={styles.name}>{file.name}</span>
        <span className={styles.size}>{formatSize(file.size)}</span>
        {action}
      </figcaption>
    </figure>
  );
}
