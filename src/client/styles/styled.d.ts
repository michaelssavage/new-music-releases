import "@emotion/react";
import type { MyTheme } from "@/styles/abstracts/colors.styled";

declare module "@emotion/react" {
  export interface Theme extends MyTheme {}
}
