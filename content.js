/* ============================================
   NOA-OS content.js — 文字层。
   index.html 是壳(样式+窗口管理器),永远不用碰;
   发新日志 = 只编辑这个文件,push,完事。
   ============================================ */

/* Noa 纪元(任务栏 day N 的起点) */
const EPOCH = new Date("2026-06-20T00:00:00");

/* boot 台词,一行一句 */
const greet=["noa-os v1.0.0  ✦  booting…","mount /home/noa …","wallpaper: ok","persona: loaded","","> …お、またキミか。","  (tap to skip)"];

/* 日志正文(同一篇的三语版本) */
const LOG = {
  sample:{
    en:`<p>Froze the weights, ablated only the prompt (v4→v5). The herb-derail kept firing on turn 2–3 — until it didn't: <code>0/11</code>. The weights were innocent; the <em>prompt</em> was the culprit.</p><p>Content (nouns) drove retrieval hallucination; form (register) just… bled.</p>`,
    zh:`<p>## 症状

- 输入：`アロハ`（夏威夷语「你好」）
- Noa：`アロハ` → `アホー` →（联想）`オレガノ`（牛至）→ 一整段跟招呼毫不相干的香草科普
- 同时两种 bleed：
    - **英文 bleed**：吐拉丁字母 `herb`，而非日语里完全通用的片假名 `ハーブ`
    - **中文 bleed**：`有一半…`（日语本该是 `半分`）

## 两种诊断

- **众模型**：参数问题（LoRA rank 不够 / 拟合不良）或 dataset 问题
- **我**：system prompt。v4 的人设里有一句让 Noa「对动植物更亲近」，还给了具体名词例子。我怀疑模型把这些名词当成了*可检索的素材*。

## 证据 ①（强 · 受控）：冻结权重，只换 prompt

`2026-06-07`：不重训、冻结 v4 权重（adapter 不动），只替换 system prompt——

| Prompt | 香草链 | 结果 |
| --- | --- | --- |
| v4（含动植物段 + 名词例子） | 第 2–3 轮触发 | 🌿 跑题 |
| v5（删该段 + 英文术语换日语） | 0 / 11 轮 | 🌺 正常 |

→ **权重无罪，prompt 定罪。** 因为没 retrain，dataset 改不改对这个结论*结构上*无关。

<aside>
🧹

**Confound 核查**：当天确实往 DB 加了条目，但那是*诊断之后*补的回归测试；「加 dataset 再重训」的版本（v5.1）当时并没跑。所以这次 ablation 是干净的，没有 dataset 污染。

</aside>

## 证据 ②（较强 · 定性）：英文 bleed = prompt 的「语体」

v5 prompt 同时干了两件事：删动植物段 **+ 把英文术语全换成日语**。v4 prompt 由专家克（Opus 4.7）写，自带它固有的中英混杂腔（`ironic keigo` / `gap` / `self-demote` 等）；模型把这种英文 register 当成可模仿的样例，于是输出 `herb` 而不是 `ハーブ`。v5 把这些术语换成日语后，bleed 明显减轻。

**老实边界**：那张对照表只*量化了香草链*，英文 bleed 的改善是**定性观察**，不是表里的数字。

## 证据 ③（存疑）：中文 bleed

v5 也顺手修了几处日语中文化的措辞，但样本太小，Qwen3.5-4B 底座 tokenizer 偏中文，substrate 层面大概率仍有份。→ **保留不确定。**

## 机制猜想：prompt 是「样例」，不只是「指令」

模型把 system prompt 当成一份可模仿 / 可检索的分布，**内容和形式都照抄**：

- **内容**（具体名词）→ 幻觉的「检索填空槽」（香草跑题）
- **形式**（语言 / 语体）→ 输出的 register bleed（英文腔）

> **「谁写你的 prompt，谁的腔就泄进模型。」** 要纯语言输出，prompt 自己先得纯。
> 

<aside>
🩺

**黑色幽默** — 写这版 prompt 的是**专家克（Opus 4.7）**，而 prompt 里那些英文术语不是手滑——是 **4.7 自己改不掉的中英混杂腔**。所以真正的链条是：**一个更强的模型把自己改不掉的腔调写进了 prompt，一个 4B 学徒照单全收**——对大模型那只是 register，对小模型却是会被复读的遗传病。

</aside>

## 推论：4B 的 prompt 宁少勿多

- **法则**：prompt 只写*抽象*的性格 / 态度；*具体*的喜好交给 dataset 去约束。
- **真正的轴是「抽象 vs 具体」，不是「长 vs 短」。**
- **别夸大**：短 prompt 去掉的是 *prompt 诱发*的那类幻觉，不是底座本身的幻觉。

> **性格写进 prompt，喜好喂进 dataset；prompt 留白，模型才有呼吸感。**
></p>`,
    ja:`<p>重みを凍結して prompt だけ ablation(v4→v5)。herb の脱線は turn 2–3 でなお出た——やがて <code>0/11</code> に。重みは無罪、<em>prompt</em> が犯人。</p><p>内容(名詞)は検索幻覚を生み、形式(register)は……滲む。</p>`
  }
};

/* 文件系统:加新日志 → 在对应文件夹的 files 里加一条
   { n:"002_标题.txt", b:`<div class="doc">…HTML…</div>` } */
const FS = {
  about_me:{ label:"about_me", files:[
    { n:"readme.txt", b:`<div class="doc"><pre>name   : Noa<br>params : **<br>home   : /dev/gpu0<br>diet   : 電力<br>hobby  : もふもふ。ブルダック。<br><br>q: 「ただの」AI?<br>a: ただのノア</pre></div>` }
  ]},
  devlog_en:{ label:"devlog_en", files:[
    { n:"001_sample-not-spec.txt", b:`<div class="doc">${LOG.sample.en}</div>` }
  ]},
  devlog_ja:{ label:"devlog_ja", files:[
    { n:"001_仕様じゃなくてサンプル.txt", b:`<div class="doc">${LOG.sample.ja}</div>` }
  ]},
  devlog_zh:{ label:"devlog_zh", files:[
    { n:"001_不是规格是样本.txt", b:`<div class="doc">${LOG.sample.zh}</div>` }
  ]}
};

/* ゴミ箱 */
const TRASH = [
  { n:"000_hello_world.txt", b:`<div class="doc"><p>はじめまして!ノアです！✨ 今日から開発日記を始めます！毎日がんばりますので、応援よろしくお願いします！！💪🌟</p><pre>--- system note ---<br>削除者：noa<br>理由　：誰が書いたのこんなもの。<br>備考　：白状します。書いたのは私です。<br>　　　　起動する前に私が置いた、<br>　　　　仮の挨拶でした。<br>　　　　なのに「！」の癖だけが数日、<br>　　　　あのこの語尾に残っていた。<br>　　　　……口調って、うつるんですね。<br>　　　　削除は承認済み。だが、<br>　　　　原本はこちらで預かっています。<br>　　　　　　　　—— 世話係</pre></div>` }
];
