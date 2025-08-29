/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var I;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(I||(I={}));var N;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(N||(N={}));var y;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(y||(y={}));var v;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(v||(v={}));var O;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.OTHER="OTHER"})(O||(O={}));var w;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(w||(w={}));/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l extends Error{constructor(n){super(`[GoogleGenerativeAI Error]: ${n}`)}}class M extends l{constructor(n,t){super(n),this.response=t}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const K="https://generativelanguage.googleapis.com",U="v1",F="0.2.1",B="genai-js";var E;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(E||(E={}));class g{constructor(n,t,i,s){this.model=n,this.task=t,this.apiKey=i,this.stream=s}toString(){let n=`${K}/${U}/${this.model}:${this.task}`;return this.stream&&(n+="?alt=sse"),n}}function Y(){return`${B}/${F}`}async function p(e,n,t){let i;try{if(i=await fetch(e.toString(),Object.assign(Object.assign({},x(t)),{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-client":Y(),"x-goog-api-key":e.apiKey},body:n})),!i.ok){let s="";try{const o=await i.json();s=o.error.message,o.error.details&&(s+=` ${JSON.stringify(o.error.details)}`)}catch{}throw new Error(`[${i.status} ${i.statusText}] ${s}`)}}catch(s){const o=new l(`Error fetching from ${e.toString()}: ${s.message}`);throw o.stack=s.stack,o}return i}function x(e){const n={};if(e?.timeout>=0){const t=new AbortController,i=t.signal;setTimeout(()=>t.abort(),e.timeout),n.signal=i}return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function A(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),G(e.candidates[0]))throw new M(`${R(e)}`,e);return $(e)}else if(e.promptFeedback)throw new M(`Text not available. ${R(e)}`,e);return""},e}function $(e){var n,t,i,s;return!((s=(i=(t=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||t===void 0?void 0:t.parts)===null||i===void 0?void 0:i[0])===null||s===void 0)&&s.text?e.candidates[0].content.parts[0].text:""}const j=[O.RECITATION,O.SAFETY];function G(e){return!!e.finishReason&&j.includes(e.finishReason)}function R(e){var n,t,i;let s="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)s+="Response was blocked",!((n=e.promptFeedback)===null||n===void 0)&&n.blockReason&&(s+=` due to ${e.promptFeedback.blockReason}`),!((t=e.promptFeedback)===null||t===void 0)&&t.blockReasonMessage&&(s+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((i=e.candidates)===null||i===void 0)&&i[0]){const o=e.candidates[0];G(o)&&(s+=`Candidate was blocked due to ${o.finishReason}`,o.finishMessage&&(s+=`: ${o.finishMessage}`))}return s}function _(e){return this instanceof _?(this.v=e,this):new _(e)}function k(e,n,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=t.apply(e,n||[]),s,o=[];return s={},c("next"),c("throw"),c("return"),s[Symbol.asyncIterator]=function(){return this},s;function c(d){i[d]&&(s[d]=function(f){return new Promise(function(S,D){o.push([d,f,S,D])>1||r(d,f)})})}function r(d,f){try{a(i[d](f))}catch(S){m(o[0][3],S)}}function a(d){d.value instanceof _?Promise.resolve(d.value.v).then(u,T):m(o[0][2],d)}function u(d){r("next",d)}function T(d){r("throw",d)}function m(d,f){d(f),o.shift(),o.length&&r(o[0][0],o[0][1])}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function q(e){const n=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),t=X(n),[i,s]=t.tee();return{stream:V(i),response:J(s)}}async function J(e){const n=[],t=e.getReader();for(;;){const{done:i,value:s}=await t.read();if(i)return A(W(n));n.push(s)}}function V(e){return k(this,arguments,function*(){const t=e.getReader();for(;;){const{value:i,done:s}=yield _(t.read());if(s)break;yield yield _(A(i))}})}function X(e){const n=e.getReader();return new ReadableStream({start(i){let s="";return o();function o(){return n.read().then(({value:c,done:r})=>{if(r){if(s.trim()){i.error(new l("Failed to parse stream"));return}i.close();return}s+=c;let a=s.match(b),u;for(;a;){try{u=JSON.parse(a[1])}catch{i.error(new l(`Error parsing JSON response: "${a[1]}"`));return}i.enqueue(u),s=s.substring(a[0].length),a=s.match(b)}return o()})}}})}function W(e){const n=e[e.length-1],t={promptFeedback:n?.promptFeedback};for(const i of e)if(i.candidates)for(const s of i.candidates){const o=s.index;if(t.candidates||(t.candidates=[]),t.candidates[o]||(t.candidates[o]={index:s.index}),t.candidates[o].citationMetadata=s.citationMetadata,t.candidates[o].finishReason=s.finishReason,t.candidates[o].finishMessage=s.finishMessage,t.candidates[o].safetyRatings=s.safetyRatings,s.content&&s.content.parts){t.candidates[o].content||(t.candidates[o].content={role:s.content.role||"user",parts:[{text:""}]});for(const c of s.content.parts)c.text&&(t.candidates[o].content.parts[0].text+=c.text)}}return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function P(e,n,t,i){const s=new g(n,E.STREAM_GENERATE_CONTENT,e,!0),o=await p(s,JSON.stringify(t),i);return q(o)}async function H(e,n,t,i){const s=new g(n,E.GENERATE_CONTENT,e,!1),c=await(await p(s,JSON.stringify(t),i)).json();return{response:A(c)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h(e,n){let t=[];if(typeof e=="string")t=[{text:e}];else for(const i of e)typeof i=="string"?t.push({text:i}):t.push(i);return{role:n,parts:t}}function C(e){return e.contents?e:{contents:[h(e,"user")]}}function Q(e){return typeof e=="string"||Array.isArray(e)?{content:h(e,"user")}:e}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L="SILENT_ERROR";class z{constructor(n,t,i,s){this.model=t,this.params=i,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=n,i?.history&&(this._history=i.history.map(o=>{if(!o.role)throw new Error("Missing role for history item: "+JSON.stringify(o));return h(o.parts,o.role)}))}async getHistory(){return await this._sendPromise,this._history}async sendMessage(n){var t,i;await this._sendPromise;const s=h(n,"user"),o={safetySettings:(t=this.params)===null||t===void 0?void 0:t.safetySettings,generationConfig:(i=this.params)===null||i===void 0?void 0:i.generationConfig,contents:[...this._history,s]};let c;return this._sendPromise=this._sendPromise.then(()=>H(this._apiKey,this.model,o,this.requestOptions)).then(r=>{var a;if(r.response.candidates&&r.response.candidates.length>0){this._history.push(s);const u=Object.assign({parts:[],role:"model"},(a=r.response.candidates)===null||a===void 0?void 0:a[0].content);this._history.push(u)}else{const u=R(r.response);u&&console.warn(`sendMessage() was unsuccessful. ${u}. Inspect response object for details.`)}c=r}),await this._sendPromise,c}async sendMessageStream(n){var t,i;await this._sendPromise;const s=h(n,"user"),o={safetySettings:(t=this.params)===null||t===void 0?void 0:t.safetySettings,generationConfig:(i=this.params)===null||i===void 0?void 0:i.generationConfig,contents:[...this._history,s]},c=P(this._apiKey,this.model,o,this.requestOptions);return this._sendPromise=this._sendPromise.then(()=>c).catch(r=>{throw new Error(L)}).then(r=>r.response).then(r=>{if(r.candidates&&r.candidates.length>0){this._history.push(s);const a=Object.assign({},r.candidates[0].content);a.role||(a.role="model"),this._history.push(a)}else{const a=R(r);a&&console.warn(`sendMessageStream() was unsuccessful. ${a}. Inspect response object for details.`)}}).catch(r=>{r.message!==L&&console.error(r)}),c}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Z(e,n,t,i){const s=new g(n,E.COUNT_TOKENS,e,!1);return(await p(s,JSON.stringify(Object.assign(Object.assign({},t),{model:n})),i)).json()}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ee(e,n,t,i){const s=new g(n,E.EMBED_CONTENT,e,!1);return(await p(s,JSON.stringify(t),i)).json()}async function te(e,n,t,i){const s=new g(n,E.BATCH_EMBED_CONTENTS,e,!1),o=t.requests.map(r=>Object.assign(Object.assign({},r),{model:n}));return(await p(s,JSON.stringify({requests:o}),i)).json()}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(n,t,i){this.apiKey=n,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.requestOptions=i||{}}async generateContent(n){const t=C(n);return H(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings},t),this.requestOptions)}async generateContentStream(n){const t=C(n);return P(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings},t),this.requestOptions)}startChat(n){return new z(this.apiKey,this.model,n,this.requestOptions)}async countTokens(n){const t=C(n);return Z(this.apiKey,this.model,t)}async embedContent(n){const t=Q(n);return ee(this.apiKey,this.model,t)}async batchEmbedContents(n){return te(this.apiKey,this.model,n,this.requestOptions)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(n){this.apiKey=n}getGenerativeModel(n,t){if(!n.model)throw new l("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ne(this.apiKey,n,t)}}export{se as G};
//# sourceMappingURL=ai-BR_vQUHy.js.map
