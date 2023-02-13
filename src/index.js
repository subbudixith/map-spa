import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import ReactDOM from "react-dom";
import "./assets/styles/index.scss";
import Boot from "./boot";
import theme from "./config/theme";

/**
 *  Entry Point
 */
ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <Boot />
  </ThemeProvider>,
  document.getElementById("root")
);
