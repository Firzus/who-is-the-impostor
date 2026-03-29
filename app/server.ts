/**
 * Custom server entry: run server-only side effects before Start boots.
 * Do not import this file from client code.
 */
import "@/server/cleanup";

export { default } from "@tanstack/react-start/server-entry";
