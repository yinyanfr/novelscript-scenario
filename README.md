# novelscript-scenario

Novelscript Scenario，下称NSS，是重新设计的，用于 novelscript 的脚本语言。

Novelscript 的设计逻辑是，提供能够置入页面的简单视觉小说段落，这也是novelscript选择基于DOM而非canvas的原因。Novelscript 实现视觉小说的呈现，而其余部分则由使用者自行扩展。

基于这个前提，novelscript 选择使用脚本语言而非可视化编辑器。

并基于创作者视角，更加注重脚本语言编写的体验。

同时为了扩展性，模板上的功能也提供了外置JavaScript定义的方式。

NSS目前处于草案阶段。

草案详见 [First Draft](draft/README.md)

根据草案写成的示例：[Example](example/chapter1.nss)
