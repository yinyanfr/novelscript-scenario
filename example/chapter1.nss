@meta
@author: Mary Sue
@chapter: intro
@episode: 1

@import template angry
@let looking cool
@endmeta


@enter 连雨遥@急切 俞南之@急切
连雨遥：非洲农业不发达，必须要有金坷垃。

@leave 连雨遥
俞南之：日本资源太缺乏，必须要有金坷垃。

@animated popUp sync
@enterFrom right 立夏@哂笑
立夏：不能打架，不能打架，金坷垃好处都有啥，谁说对了就给她。

@mark 金坷垃2
@clear
@enter 连雨遥@开心
连雨遥：肥料掺了金坷垃，
@each advantage of=jinkela.advantages
@push {advantage}，
@endeach

@enterNextTo 连雨遥 俞南之@开心
俞南之：肥料掺了金坷垃，能吸收两米下的氮磷钾。
日本的粮食再也不用向美国进口啦。
@push 哈哈哈哈！

@clear
@hideUI dialog
@enter 立夏@思考
@select
@option 给非洲 (@set kela=africa)
@option 给日本 (@set kela=japan)
@option 去演唱会 disabled=true
@option 全世界农业都发达 (@forward goodEnd) hidden=(@is looking cool)
@endselect

@showUI dialog
@if (@id kela africa)
立夏：小鬼子，真不傻，金坷垃给了他，对美国农业危害大
决不能给他！

@enter 连雨遥@满足
立夏：非洲农业不发达，我们都要支援他，
金坷垃，你们日本别想啦！

@enterFrom right 俞南之@崩溃
俞南之：没有金坷垃，怎么种庄稼，
{@template angry "金坷垃，金坷垃！"}

@else 
@forward badEnd 1

