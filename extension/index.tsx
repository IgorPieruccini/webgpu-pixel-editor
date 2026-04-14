/* @refresh reload */
import { render } from "solid-js/web";
import "../src/index.css";
import AppExtension from "./AppExtension.tsx";

const root = document.getElementById("root");

render(() => <AppExtension />, root!);
