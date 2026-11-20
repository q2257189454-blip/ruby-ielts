// The two supplied Task 2 texts. Only the named slots vary by question.
export const essayFrames = {
 full: [
  [
   ['The issue surrounding {t} has attracted widespread attention.', '围绕「{t}」的问题引起了广泛关注。'],
   ['From my perspective, {s}.', '我认为，{s}。'],
   ['This essay will examine the issue in greater depth, with a particular focus on the key considerations involved.', '下文将进一步探讨这个问题，重点分析其中的关键因素。']
  ],
  [
   ['It is particularly important to recognize that {a0}.', '尤其值得注意的是，{a0}。'],
   ['This can be largely explained by the fact that {a1}.', '这在很大程度上是因为{a1}。'],
   ['As a consequence, {a2}, thereby creating favourable conditions for {a3}.', '因此，{a2}，这也为「{a3}」创造了有利条件。'],
   ['More importantly, in the long run, this initial improvement may gradually contribute to {a4}.', '更重要的是，从长远看，这一初步改善可能逐步促成「{a4}」。'],
   ['For these reasons, {a5}.', '基于这些原因，{a5}。']
  ],
  [
   ['Beyond the benefits discussed above, another compelling argument in favour of this position is that {b0}.', '除了上述好处，支持这一立场的另一个有力理由是，{b0}。'],
   ['Without {b2}, it would be difficult for {b1} to {b3}.', '如果缺少「{b2}」，{b1}就很难{b3}。'],
   ['For example, {b4}.', '例如，{b4}。'],
   ['This example suggests that {b5}, making it clear why {noun2} should not be overlooked.', '这个例子表明，{b5}。由此可见，「{noun2}」值得重视。'],
   ['Therefore, {b6}.', '因此，{b6}。']
  ],
  [
   ['Nevertheless, opponents of this view may argue that {r0}, mainly because {r1}.', '持不同意见的人可能认为，{r0}，主要原因是{r1}。'],
   ['Admittedly, this concern is reasonable to some extent, particularly when {r2}.', '诚然，这种顾虑有一定道理，尤其是在{r2}的情形下。'],
   ['However, this argument fails to fully consider that {r3}.', '不过，这一说法没有充分考虑到，{r3}。'],
   ['If {rAction}, the negative consequences associated with {r5} could be significantly reduced.', '如果{rAction}，与「{r5}」相关的不利影响就有望显著减轻。'],
   ['Consequently, although this concern deserves attention, it does not provide sufficient grounds to reject {r6}.', '因此，这个顾虑值得关注，但还不足以否定「{r6}」。']
  ],
  [
   ['In summary, {z0}.', '综上，{z0}。'],
   ['A key reason supporting this position is that {z1}.', '支持这一立场的关键理由是，{z1}。'],
   ['Beyond this, it is equally important to recognize that {z2}.', '此外，同样重要的是，{z2}。'],
   ['Taken together, these considerations provide a compelling justification for the position outlined above.', '综合来看，这些理由有力地支持了上述立场。']
  ]
 ],
 simple: [
  [
   ['The issue surrounding {t} has attracted a lot of attention.', '围绕「{t}」的问题引起了很多关注。'],
   ['In my view, {s}.', '我认为，{s}。'],
   ['The essay will discuss the main points in more detail.', '下文将更详细地讨论这些要点。'],
   ['This essay will explain the main reasons for this view and talk about different opinions.', '本文将解释这一看法的主要理由，并讨论不同意见。']
  ],
  [
   ['First of all, It is important to note that {a0}.', '首先，值得注意的是，{a0}。'],
   ['This is mainly because {a1}', '这主要是因为{a1}。'],
   ['As a result, {a2}， and this creates good conditions for {a3}', '结果是，{a2}，这为「{a3}」创造了有利条件。'],
   ['In the long run, this may lead to {a4}.', '从长远看，这可能带来「{a4}」。'],
   ['So it is clear that, {a5}.', '所以可以看出，{a5}。']
  ],
  [
   ['Besides, another important reason for my view is that {b0}.', '此外，支持我这一看法的另一个重要原因是，{b0}。'],
   ['If {b1} do not have {b2}, they will not be able to {b3} easily.', '如果{b1}缺少「{b2}」，就很难{b3}。'],
   ['For example, {b4}.', '例如，{b4}。'],
   ['This shows that {b5}, so its importance should not be ignored.', '这说明{b5}，因此这一点值得重视。']
  ],
  [
   ['Of course, some people may argue that {r0}, mainly because {r1}.', '当然，有人可能认为，{r0}，主要是因为{r1}。'],
   ['This idea is reasonable in some situations, especially when {r2}.', '有时这种看法是合理的，尤其是在{r2}的情形下。'],
   ['However, this is not a serious problem in fact.', '不过，实际上这个问题并不严重。'],
   ['If {rAction}, the bad effects will be greatly reduced.', '如果{rAction}，不利影响就会大大减轻。'],
   ['So this opinion is not strong enough to change my view.', '所以，这一意见还不足以改变我的看法。']
  ],
  [
   ['In conclusion, I strongly believe that {z0}.', '综上，我坚信{z0}。'],
   ['A key reason for this view is that {z1}.', '这一看法的一个关键理由是，{z1}。'],
   ['It is also important to note that {z2}.', '同样值得注意的是，{z2}。'],
   ['For the reasons above, this opinion is completely reasonable.', '基于以上理由，这一看法完全合理。']
  ]
 ]
};

export const sourceSections = {
 full: ['首段','正文段1','正文段2','反方+反驳','尾段'],
 simple: ['引言','主体段 1（原因 + 影响论证）','主体段 2（必要性 + 举例论证）','让步反驳段（让论证更全面，冲高分必加）','结尾段（总结 + 回扣立场）']
};

export const sourceSlots = {
 full: {
  t:'【题干话题】',s:'【个人观点一整句话】',
  a0:'【观点一】',a1:'【解释原因】',a2:'【短期积极影响】',a3:'【短期某项目的】',a4:'【长期积极影响】',a5:'【回扣观点】',
  b0:'【观点二】',b2:'【条件】',b1:'【主体】',b3:'【实现结果】',b4:'【情境举例】',b5:'【合理推论】',noun2:'【观点二】',b6:'【回扣观点】',
  r0:'【反方观点】',r1:'【原因】',r2:'【成立条件】',r3:'【反驳依据】',rAction:'【解决方案】',r5:'【反方问题】',r6:'【支持的观点】',
  z0:'【个人观点一整句话】',z1:'【正文段1的核心观点】',z2:'【正文段2的核心观点】'
 },
 simple: {
  t:'[题干核心话题]',s:'[你的核心立场，一句话]',
  a0:'[核心论点 1]',a1:'[解释背后的原因]',a2:'[短期影响]',a3:'[直接带来的影响]',a4:'【长期影响：名词或动词-ing 短语】',a5:'【回扣观点：完整句】',
  b0:'[核心论点 2]',b1:'[相关主体]',b2:'[前提条件]',b3:'[达成目标]',b4:'[1 句简短例子]',b5:'[回扣本段论点]',
  r0:'[反方观点]',r1:'[反方的核心理由]',r2:'[反方成立的具体场景]',rAction:'[对应的解决办法]',
  z0:'[重申核心立场]',z1:'【第二段核心观点：完整句】',z2:'【第三段核心观点：完整句】'
 }
};
