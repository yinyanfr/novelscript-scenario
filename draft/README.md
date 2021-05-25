# Novelscript Scenario First Draft

Novelscript Scenario，下称NSS，是视觉小说引擎 novelscript 的脚本语言。

Novelscript 的设计逻辑是，提供能够置入页面的简单视觉小说段落，这也是novelscript选择基于DOM而非canvas的原因。Novelscript 实现视觉小说的呈现，而其余部分则由使用者自行扩展。

基于这个前提，novelscript 选择使用脚本语言而非可视化编辑器。

并基于创作者视角，更加注重脚本语言编写的体验。

同时为了扩展性，模板上的功能也提供了外置JavaScript定义的方式。

本文是NSS的第一版草案。

## 总览

### 1. 文本与函数

```nss
@functionName parameterName=parameterValue parameter2Name=parameter2Value
speakerName@speakerStatus: text
```

#### 1.1 NSS的基本语法是，对于要呈现的文本，直接以文本开头。

#### 1.2 对于函数的执行，则以`@`开头

### 2. 呈现文本

#### 2.1 以分号分隔说话者

```nss
连雨遥@急切：非洲农业不发达，必须要有金坷垃。
```

`连雨遥`是说话者的代称，`@急切`是说话者的表情（可选）。

说话者用于显示该对白的说话者，若不指定则为旁白（无）。

表情用于在文本框一侧单独显示角色表情头像的场景。

说话者的代称和表情的代称由额外的配置文件指定。

#### 2.2 以空行表示换页

插入空行表示此处需要等待用户操作下一步（点击、自动播放、快进），显示下一句时清除原有文本。

```nss
连雨遥@急切：非洲农业不发达，必须要有金坷垃。

俞南之@急切：日本资源太缺乏，必须要有金坷垃。
```

显示效果:

- 初始

```
连雨遥：非洲农业不发达，必须要有金坷垃。
```

- 点击后

```
俞南之：日本资源太缺乏，必须要有金坷垃。
```

#### 2.3 以换行表示同页的继续

换行则表示当用户操作下一步时，保留已有内容并**换行**显示下一句。

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

若希望**不换行**达成该效果，需在第二句前添加 `@push`

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

#### 2.4 以`@break`表示换行

##### @break [text]

以break显示的换行，每个@break视为一行

```nss
连雨遥@急切：肥料掺了金坷垃，能吸收两米下的氮磷钾。
@break
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



若要直接一次性显示多行文本，则须在每个附加行前加入 `@break`

```nss
连雨遥@急切：肥料掺了金坷垃，能吸收两米下的氮磷钾
@break 世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费
```

显示效果：

```
连雨遥：肥料掺了金坷垃，能吸收两米下的氮磷钾。
世界肥料都涨价，肥料掺了金坷垃，不流失，不蒸发，零浪费。
```

#### 2.5 换页会改变说话者，换行不会

换页（空行）后需要重新指定说话者，否则变为旁白。

而换行时若不重新指定说话者，则视为说话者不变。



#### 2.6 备注

设计思路是在视觉小说中，最通常的显示模式是一句话一页，其次是每页中每句话进行一次中断。

少见情况下会不换行中断，比如表现人物上气不接下气时，

极少数情况会一次性显示多行长文本。

因此对于常见情况采用无需增加任何标记的做法，少见情况则需特殊标记。

非小说式显示的情况，同页中断则几乎都不会改变说话者，而且说话者都会在UI中单独分一块，所以换行时设计为自动继承同页中的说话者。

而小说式的情况，说话者和文本一起显示，所以也不会显得突兀。而且为了适应小说式的长文本显示，也保留了在同页中更换说话者的可能性。



### 3. 显示立绘

#### 3.1 显示静态立绘

##### @enter ...figures

- figures: Figure[] 角色@状态 或立绘代号

 显示静态立绘，以`角色@状态` 或 立绘代号 调用立绘图片。

##### @leave ...characters

- characters: Character[] 角色名或立绘代号

停止显示立绘，以角色名或立绘代号指定立绘图片。

##### @enterFrom position ...figures

- position: literal `left` or `right`

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
- method: literal `async`(default) or `sync` 是否异步执行

以动画方式插入角色，`@animated`同时适用于3.1中的所有函数

##### @animate name [...args] (待定)

- name: string 自定义动画名字

```nss
@animated fadeIn async
@enter 连雨遥@急切 俞南之@急切
连雨遥：非洲农业不发达，必须要有金坷垃。
```

```nss
// ... meta
@animate popUp from=bottom:-50 to=bottom:0 duration=1

@animated popUp sync
@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！
```

#### 3.3 外置动画定义 (待定)

```js
// animation.ts

export const popUp: Animation = () => {
    // TBD
}
```

```nss
@animated popUp sync
@enterFrom right 立夏@哂笑
立夏：金坷垃，你们日本别想啦！
```



### 4. 显示其他元素

#### 4.1 背景

##### @background background

- background: Background asset name or imageUri or color or gradiant

```nss
@background classroom@sunset
```

#### 4.2 Bgm

##### @bgm bgm [...args]

- bgm: Bgm asset name
- volume: number
- loop: boolean = true

```nss
@bgm lastMemory volume=80
```

#### 4.3 Voice

配音应当在剧本完成后自动根据行号生成配音稿，并按照行号命名音频文件，通过引擎自动播放。



### 5. 显示动态内容

#### 5.1 模板显示变量

##### @let name=value

新建变量

##### @set name=value

修改已有变量值

##### @assign name=value

修改已有变量值，若变量不存在，则新建该变量

在正文中以`{}`包裹变量。

```nss
@let country=日本
金坷垃，你们{country}别想啦
```

#### 5.2 根据条件显示部分内容 (待定)

##### @condition condition ？ ：

条件操作符

##### @is var value

比较变量值，同时适用于 **@lt, @lte, @gt, @gte** 等

```nss
金坷垃，你们{@condition (@is japan cunning) ? 日本 : 非洲}别想啦
```

#### 5.3 根据条件显示整段内容

##### @if condition

##### @elseif condition

##### @else

##### @endif

```nss
@if (@gte point.lianYuyao 5)
俞南之：明明是我先来的

俞南之：xx也好，yy也好

@else
连雨遥：明明是我先来的

连雨遥：xx也好，yy也好

@endif
```

#### 5.4 循环、遍历显示内容

##### @for i of

##### @endfor

```nss
@for i of=point.lianYuyao // number
连雨遥：我再说一遍，这是第{i}遍了
@endfor
```

##### @each item of

##### @endeach

```
现在背包里有这些物品：
@each item of=inventory // array
@break {item.name}: {item.detail}
@endeach
```

#### 5.5 自定义模板

##### @template name ...parameters

```js
// template.ts

export const angry: Template = (str) => {
    return str.toUpperCase().replace(/\./g, "!")
}
```

```
I'm {@template angry text.angryText}
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

#### 6.2 段落标记

```nss
@mark 金坷垃2
连雨遥@急切：非洲农业不发达，必须要有金坷垃。

俞南之@急切：日本资源太缺乏，必须要有金坷垃。
```



### 7. 分歧与跳转

#### 7.1 跳转

##### @forward chapter [episode [mark]]

跳转至某章节、段落（第一段）、标记（开头）

每个剧本结尾时若没有特别指定，将跳转至配置中的下一篇

```
俞南之@急切：日本资源太缺乏，必须要有金坷垃。

@forward intro 2 金坷垃3
```

#### 7.2 选项 (待定)

##### 模板式

```nss
@select
@option 给非洲 (@set kela=africa)
@option 给日本 (@set kela=japan)
@option 去演唱会 disabled=true
@option 全世界农业都发达 (@forward goodEnd) hidden=(@is looking cool)
@endselect
```

##### 外置式

```js
// select.ts

export const jinkela: Select = ({context}) => ([
    {
        label: "给非洲"
        consequence() {
    		context.kela = "japan"
    	},
        disabled: () => true,
        hidden: () => context.looking === "cool"
    }
])
```

```nss
@select jinkela
```



