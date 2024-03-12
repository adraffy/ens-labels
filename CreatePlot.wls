#!/usr/bin/env wolframscript

v = Import["labels.json"];
m = SortBy[Tally[Min[30, StringLength[#]] & /@ v], First];
m = m /. {{30, x_} :> {"30+", x}};
max = Max[m[[All, 2]]];
step = 50000;
raster = 1600;
color = Gray;
bg = Opacity[0.15, Gray];
padded[x_] := 
  Framed[x, FrameStyle -> None, FrameMargins -> {{5, 5}, {0, 0}}];
g = BarChart[Labeled[#2, Column[{
       Rotate[
        Style[padded@PercentForm[#2/Length[v] // N], color, 20, 
         Background -> bg], 90 Degree],
       Style[#1, 30, color, Bold]
       }, Alignment -> Center, Spacings -> 0.5], Above] & @@@ m,
  ColorFunction -> ColorData["Rainbow"],
  Ticks -> {Automatic, {#, 
       Style[ToString[#/1000] <> "K", color, 24]} & /@ 
     Range[step, Max[m[[All, 2]]], step]},
  BarSpacing -> None,
  ImageSize -> raster,
  GridLines -> Automatic, 
  AxesLabel -> (Style[padded[#], 24, Bold, color, 
       Background -> bg] & /@ {"Length", "Labels"})]
Export["plot.svg", g, IncludeMetaInformation->False]
