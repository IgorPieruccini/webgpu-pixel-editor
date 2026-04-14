/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import AppExtension from "./AppExtension.tsx";
import "@kittl/ui";
import "@kittl/ui/Styles";

const root = document.getElementById("root");

render(() => <AppExtension />, root!);
