# Novelscript Scenario First Draft

Novelscript Scenario，下称 NSS，是视觉小说引擎 novelscript 的脚本语言。

Novelscript 的设计逻辑是，提供能够置入页面的简单视觉小说段落，这也是 novelscript 选择基于 DOM 而非 canvas 的原因。Novelscript 实现视觉小说的呈现，而其余部分则由使用者自行扩展。

基于这个前提，novelscript 选择使用脚本语言而非可视化编辑器。

并基于创作者视角，更加注重脚本语言编写的体验。

同时为了扩展性，模板上的功能也提供了外置 JavaScript 定义的方式。

本文是 NSS 的第一版草案。

## 总览

### 1. 文本与函数

NSS 的基本语法是：以`@`开头的“tag”名（即函数名），后接固定参数的值，和可选参数的名字和值。

```nss
@tagName ...fixedParameterValues [...optionalParameterName=value]
```

将被转译为：

```json
{
  "tag": "tagName",
  "params": {
    "fixed": ["fixedParameterValue1", "fixedParameterValueN"],
    "optional": {
      "optionalParameterName1": "value1",
      "optionalParameterNameN": "valueN"
    }
  }
}
```

**NSS 中所有的符号，除`.`外全半角通用。**

### 2. 呈现文本

#### 2.1 使用 Printer

##### @print text

##### @next

```nss
@print 连雨遥@急切：非洲农业不发达，必须要有金坷垃。
@next
@print 俞南之@急切：日本资源太缺乏，必须要有金坷垃。
```

@print 可以将一行文字显示在对应的文字显示组件上，**然后等待下一步操作**，

@next 等待换页操作（通常为客户端鼠标点击），将清除当前显示的文本**和说话者**，以显示下一步的内容

`连雨遥`是说话者的代称，`@急切`是说话者的表情（用于在文本框显示角色头像的状况）（可选）。

说话者用于显示该对白的说话者，若不指定则为旁白（无）。

表情用于在文本框一侧单独显示角色表情头像的场景。

说话者的代称和表情的代称由额外的配置文件指定。

由于文本文字有包含空格和其他符号的特殊性，**`@print`固定只接受一个参数，`@print`后的所有文本都将被解析为同一个参数**

#### 2.2 语法糖：省略`@print`和`@next`

所有不以`@tagName`开头的有内容的行，将被视为`@print`，

所有空行将被视为`@next`

因此 2.1 中的例子将被写为如下格式。

```nss
连雨遥@急切：非洲农业不发达，必须要有金坷垃。

俞南之@急切：日本资源太缺乏，必须要有金坷垃。
```

这是 NSS 推荐的写法，也是剧本创作中自然的写法，以下将沿用这种写法。

显示效果:

- 初始

```
连雨遥：非洲农业不发达，必须要有金坷垃。
```

- 点击后

```
俞南之：日本资源太缺乏，必须要有金坷垃。
```

#### 2.3 换行

并列的`@print`会换行

```nss
连雨遥@急切：肥料掺了金坷垃，能吸收两米下的氮磷钾。
世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费。
```

显示效果：

- 初始

```
连雨遥：肥料掺了金坷垃，能吸收两米下的氮磷钾。
```

- 点击后

```
连雨遥：肥料掺了金坷垃，能吸收两米下的氮磷钾。
世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费。
```

##### @push text

`@push` 不插入换行，鼠标点击后在同一行继续输出文字。

```nss
连雨遥@急切：肥料掺了金坷垃，能吸收两米下的氮磷钾
@push 世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费。
```

显示效果：

- 初始

```
连雨遥：肥料掺了金坷垃，能吸收两米下的氮磷钾。
```

- 点击后

```
连雨遥：肥料掺了金坷垃，能吸收两米下的氮磷钾。世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费。
```

`@push`与`print`相同，会将所有后续内容合并为同一参数处理

##### 一次点击显示多行文本

在文本换行处使用换行符（\n）

**换页会改变说话者，换行不会。**

换页（空行）后需要重新指定说话者，否则变为旁白。

而换行时若不重新指定说话者，则视为说话者不变。

#### 备注

设计思路是在视觉小说中，最通常的显示模式是一句话一页，其次是每页中每句话进行一次中断。

少见情况下会不换行中断，比如表现人物上气不接下气时，

极少数情况会一次性显示多行长文本。

因此对于常见情况采用无需增加任何标记的做法，少见情况则需特殊标记。

非小说式显示的情况，同页中断则几乎都不会改变说话者，而且说话者都会在 UI 中单独分一块，所以换行时设计为自动继承同页中的说话者。

而小说式的情况，说话者和文本一起显示，所以也不会显得突兀。而且为了适应小说式的长文本显示，也保留了在同页中更换说话者的可能性。

### 3. 显示立绘

#### 3.1 显示静态立绘

##### @enter ...figures

- figures: Figure[] 角色@状态 或立绘代号

显示静态立绘，以`角色@状态` 或 立绘代号 调用立绘图片。

角色、状态，以及对应图片的引用源预先写入配置文件。

##### @leave ...characters

- characters: (Character|Figure)[] 角色名或立绘代号

从舞台中去除对应立绘，以角色名或立绘代号指定立绘图片。

##### @enterFrom position ...figures

- position: "left" | "right"

从左侧或右侧插入新立绘

##### @enterNextTo character ...figures

在某个角色右侧插入新立绘

##### @change character figure

将某个角色的立绘替换为另一张立绘

```nss
@enter 连雨遥@急切 俞南之@急切
连雨遥：非洲农业不发达，必须要有金坷垃。

@leave 连雨遥
俞南之：日本资源太缺乏，必须要有金坷垃。

@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！

@enterNextTo 俞南之 连雨遥@开心
@change 俞南之 俞南之@悲伤
俞南之：没有金坷垃，怎么种庄稼，金坷垃，金坷垃！
```

#### 3.2 以动画插入立绘 (待定)

##### @animated animation [method]

- animation: Animation 预置或自定义动画名
- method: "async" (default) | "sync" 是否异步执行

注意：同步(”sync“) 将使舞台等待动画执行完成后再执行下一步。

以动画方式插入角色，`@animated`同时适用于 3.1 中的所有函数

##### @animate name [...args] (待定)

- name: string 自定义动画名字

```nss
@animated fadeIn async
@enter 连雨遥@急切 俞南之@急切
连雨遥：非洲农业不发达，必须要有金坷垃。
```

```nss
// meta
@animate popUp from=bottom:-50 to=bottom:0 duration=1

@animated popUp sync
@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！
```

#### 3.3 外置动画定义 (待定)

##### From Script

```js
// animation.ts

export const popUp: Animation = () => {
  // TBD
};
```

```nss
@animated popUp sync
@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！
```

##### From Stylesheet

```css
/* animation.css/less/sass/scss */
.popUp {
  transition: width 2s, height 2s, background-color 2s, transform 2s;
}
```

```nss
@className popUp
@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！
```

### 4. 显示其他元素

#### 4.1 背景

##### @bg background transition

- background: Background asset name or imageUrl or color or gradiant
- transition: "default" | "ease" | ... | CSSClassName

```nss
@background classroom@sunset ease
```

#### 4.2 Bgm

##### @bgm bgm [...args]

- bgm: Bgm asset name
- volume: number (optional, default to configuration)
- loop: boolean = true

```nss
@bgm lastMemory volume=80
```

#### 4.3 Voice

配音应当在剧本完成后自动根据行号生成配音稿，并按照行号命名音频文件，通过引擎自动播放。

### 5. 显示动态内容

#### 5.1 运行时运算

##### @set name value

修改变量值，若变量不存在，则新建该变量

变量将被解析为数字或字符串

以`{}`包裹需在运行时运算的内容。

`{}`内部使用`()`包裹需在运行时运算的内容，通常用于将变量用于适用字面量的情况（见5.2）。

```nss
@set country 日本
@set depth 2000
金坷垃，你们{country}别想啦
吸收{depth*10000}米下的氮磷钾
```

#### 5.2 根据条件显示部分内容

##### @if condition

##### @else

```nss
@if (@is japan cunning)
金坷垃，你们日本别想啦
@else
金坷垃，你们都别想啦
@endIf
```

##### condition ？ ：

条件操作符

##### @is var value

var 是变量名， value 是字面值，若要采用变量值，需加括号

比较变量值，同时适用于 **@lt, @lte, @gt, @gte** 等

```nss
金坷垃，你们{(@is japan cunning) ? 日本 : 非洲}别想啦 // japan === "cunning"

金坷垃，你们{(@gte relation.japan (relation.africa)) ？ 日本 ：非洲}别想啦 // relation.japan >= relation.africa
```

##### @and(or) ...conditions

```nss
@and (@is japan cunning) (@or (@is africa undeveloped) (@is america threatened)) // japan === "cunning" && (africa === "undeveloped" || america === "threatened")
```

##### @not condition

##### @not var value

```nss
@not (@is japan cunning) // !(japan === "cunning")
@not looking cool // looking !== cool
```

#### 5.3 分块显示内容

##### @block blockName

##### @end blockName

```nss
@block favorAfrica
立夏：非洲农业不发达，我们都要支援他，金坷垃，你们日本别想啦

俞南之：狡猾，狡猾，没有金坷垃，怎么种庄稼？！金坷垃！金坷垃！
@endBlock favorAfrica

@block favorNobody
立夏：金坷垃给了他，对美国农业危害大，决不能给他！
金坷垃，你们都别想啦！
@endBlock favorNobody
```

写入 block 的内容不会直接执行，而是在剧本中被调用。

##### @useBlock blockName

```nss
@useBlock favorAfrica

@if (@is japan cunning)
@useBlock favorAfrica
@else 
@useBlock favorNobody
@endIf
```

#### 5.4 循环、遍历显示内容

取消，视觉小说中几乎不会出现要在运行时循环显示内容的情况，建议使用 block 或自定义模板

#### 5.5 自定义模板

##### @template name ...parameters

```js
// template.ts

export const furious: Template = (str) => {
  return str.toUpperCase() + "!";
};
```

```
I'm {@template furious angry} // I'm ANGRY!
```

### 6. 元信息

#### 6.1 剧本信息

```nss
@meta
@author: Mary Sue
@chapter: intro
@episode: 1
@endmeta
```

#### 6.2 段落位置标记

```nss
@mark 金坷垃2
连雨遥@急切：非洲农业不发达，必须要有金坷垃。

俞南之@急切：日本资源太缺乏，必须要有金坷垃。
```

### 7. 分歧与跳转

#### 7.1 跳转

##### @jump chapter [episode [mark]]

跳转至某章节、段落（第一段）、标记（开头）

每个剧本结尾时若没有特别指定，将跳转至配置中的下一篇

```
俞南之@急切：日本资源太缺乏，必须要有金坷垃。

@jump intro 2 金坷垃3
```

#### 7.2 选项 (待定)

##### 模板式

##### @option displayText ...consequences [...options]

```nss
@select
@option 给非洲 (@set kela africa)
@option 给日本 (@set kela japan)
@option 去演唱会 disabled=true
@option 全世界农业都发达 (@forward goodEnd) hidden=(@not looking cool)
@endselect
```

##### 外置式

```js
// select.ts

export const jinkela: Select = ({context}) => ([
    {
        label: "给非洲"
        consequence() {
    		context.variables.kela = "japan"
    	},
        disabled: false,
        hidden: context.variables.looking !== "cool"
    }
])
```

```nss
@select jinkela
```
