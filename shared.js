
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getDatabase,ref,onValue,set} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {firebaseConfig,room} from './config.js';
import {rounds,fastMoney} from './questions.js';

const app=initializeApp(firebaseConfig);

export const db=getDatabase(app);
export const auth=getAuth(app);

export {
  ref,
  onValue,
  set,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  rounds,
  fastMoney
};

export const path=ref(db,`games/${room}/public`);
export const privatePath=ref(db,`games/${room}/private`);

export function initial(){
  return {
    round:0,
    teamNames:['Team 1','Team 2'],
    scores:[0,0],
    revealed:[],
    strikes:0,
    phase:'round',
    questionVisible:false,
    fastRevealed:[],
    fastPoints:0,
    fastPlayer:1,
    customRounds:rounds,
    customFast:fastMoney,

    // iPhone opening music controls
    musicCommand:{
      action:'stop',
      id:0
    },

    // Fast Money countdown timer
    fastTimer:{
      status:'ready',
      endsAt:0
    },

    updated:Date.now()
  };
}

export function getRound(s){
  return (s.customRounds||rounds)[s.round]||rounds[0];
}

export function getFast(s){
  return s.customFast||fastMoney;
}

export function publicState(s){
  const q=getRound(s);
  const f=getFast(s);

  return {
    round:s.round,
    teamNames:s.teamNames,
    scores:s.scores,
    revealed:s.revealed||[],
    strikes:s.strikes||0,
    phase:s.phase,
    questionVisible:s.questionVisible===true,
    fastRevealed:s.fastRevealed||[],
    fastPoints:s.fastPoints||0,
    fastPlayer:s.fastPlayer||1,

    // Remote music commands
    musicCommand:s.musicCommand||{
      action:'stop',
      id:0
    },

    // Fast Money timer state
    fastTimer:s.fastTimer||{
      status:'ready',
      endsAt:0
    },

    // Regular round answers
    currentRound:[
      q[0],
      q[1].map(([a,p],i)=>
        (s.revealed||[]).includes(i)
          ?[a,p]
          :['',0]
      )
    ],

    // Fast Money answers
    fastQuestions:f.map(([prompt,answers],i)=>[
      prompt,
      (s.fastRevealed||[]).includes(i)
        ?[answers[0]]
        :[['',0]]
    ]),

    updated:s.updated
  };
}

export async function update(s,changes){
  const next={
    ...s,
    ...changes,
    updated:Date.now()
  };

  await set(privatePath,next);
  await set(path,publicState(next));
}
