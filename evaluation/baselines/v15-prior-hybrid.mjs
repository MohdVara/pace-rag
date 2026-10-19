// Rank only current reviewed records supplied by retrieval. This never approves an answer.
const stop = new Set('a an the is are was were what how has have this that about with of to and in my me can does did for your you he his which where do i it from as be at on by'.split(' '));
const tokens = text => (text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(t => !stop.has(t)).map(t => t.length > 5 ? t.replace(/(?:ing|ed|es|s)$/, '') : t);
/** BM25 over reviewed question variants AND answer bodies. Rare factual terms
 * help distinguish overlapping questions without editing approved content. */
export function answerLexicalScores(question, answers) {
 const query = [...new Set(tokens(question))];
 const records = answers.map(a => tokens([a.canonicalQuestion, ...a.alternatives.map(q => q.text), a.answerText].join(' ')));
 const average = records.reduce((n,r) => n+r.length,0) / (records.length || 1);
 const frequencies = new Map(query.map(t => [t, records.filter(r => r.includes(t)).length]));
 return new Map(answers.map((answer,index) => {
  const words=records[index], counts=new Map(); for(const word of words) counts.set(word,(counts.get(word)||0)+1);
  const score=query.reduce((sum,term) => {
   const frequency=counts.get(term)||0, df=frequencies.get(term)||0;
   const idf=Math.log(1+(answers.length-df+.5)/(df+.5));
   return sum+idf*(frequency*2.2)/(frequency+1.2*(.25+.75*words.length/(average||1)));
  },0);
  return [answer.id,score];
 }));
}

/** Field-aware intent reranking affects suggestions only, never answer approval.
 * Concepts are generic search intents, not query/answer-ID allowlists. Match the
 * canonical question rather than incidental boilerplate in its answer body. */
const intents=[
 [/\b(career|background|professional history)\b/i,/background|career/i],
 [/\b(teach\w*|education.*career|learn.*craft)\b/i,/teach/i],
 [/\b(leadership|director|management progression|engineering direction)\b/i,/leadership/i],
 [/\b(revenue|financial improvement|financial return|business gains|profit increase|measured.*(?:result|gain))\b/i,/measured|revenue.*result/i],
 [/\b(availability|available|start another|start.*role|starting date)\b/i,/available/i],
 [/\b(preview|without playing|without completing|shortcut|skip.*(?:story|decisions))\b/i,/without playing/i],
 [/\b(layer\w*|architecture|architectural)\b/i,/architecture/i],
 [/\b(save\w*|replay\w*|verification)\b/i,/verification/i],
 [/\b(contact|reach you|get in touch|email)\b/i,/contact/i],
 [/\b(overview|introduction|introduce|what.*about)\b/i,/^what is|what.*about/i],
];
const domains=[/policystreet|insurance|insurer/i,/wensymes/i,/rental|property|properties/i,/education|modernis|moderniz/i,/mondays?|simulation/i,/incident|investigation/i,/\brag\b|retrieval/i];
export function intentAdjustment(query,answer){
 let adjustment=0;const title=answer.canonicalQuestion;
 for(const [queryPattern,titlePattern]of intents)if(queryPattern.test(query))adjustment+=titlePattern.test(title)?.09:-.025;
 for(const domain of domains)if(domain.test(query))adjustment+=domain.test(title)?.045:0;
 return Math.max(-.1,Math.min(.16,adjustment));
}
