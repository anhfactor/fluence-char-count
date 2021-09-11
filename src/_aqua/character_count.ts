/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/. 
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.2.2-221
 *
 */
import { FluenceClient, PeerIdB58 } from '@fluencelabs/fluence';
import { RequestFlowBuilder } from '@fluencelabs/fluence/dist/api.unstable';
import { RequestFlow } from '@fluencelabs/fluence/dist/internal/RequestFlow';


// Services

//CharCount
//defaultId = undefined

//char_count: (from: string) => {msg:string;reply:string}
//END CharCount




//CharCountPeer
//defaultId = "CharCountPeer"

//char_count: (message: string) => string
//END CharCountPeer



// Functions

export async function countChars(client: FluenceClient, messageToSend: string, targetPeerId: string, targetRelayPeerId: string, config?: {ttl?: number}): Promise<string> {
    let request: RequestFlow;
    const promise = new Promise<string>((resolve, reject) => {
        const r = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (seq
     (seq
      (seq
       (seq
        (seq
         (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
         (call %init_peer_id% ("getDataSrv" "messageToSend") [] messageToSend)
        )
        (call %init_peer_id% ("getDataSrv" "targetPeerId") [] targetPeerId)
       )
       (call %init_peer_id% ("getDataSrv" "targetRelayPeerId") [] targetRelayPeerId)
      )
      (call -relay- ("op" "noop") [])
     )
     (xor
      (seq
       (call -relay- ("op" "noop") [])
       (call "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e" ("32e7f3e6-9f1e-4140-8281-c58bc4e59440" "char_count") [messageToSend] comp)
      )
      (seq
       (call -relay- ("op" "noop") [])
       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
      )
     )
    )
    (call -relay- ("op" "noop") [])
   )
   (par
    (seq
     (call targetRelayPeerId ("op" "noop") [])
     (xor
      (call targetPeerId ("CharCountPeer" "char_count") [messageToSend] res)
      (seq
       (seq
        (call targetRelayPeerId ("op" "noop") [])
        (call -relay- ("op" "noop") [])
       )
       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
      )
     )
    )
    (null)
   )
  )
  (xor
   (call %init_peer_id% ("callbackSrv" "response") [comp.$.reply!])
   (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', '-relay-', () => {
                    return client.relayPeerId!;
                });
                h.on('getDataSrv', 'messageToSend', () => {return messageToSend;});
h.on('getDataSrv', 'targetPeerId', () => {return targetPeerId;});
h.on('getDataSrv', 'targetRelayPeerId', () => {return targetRelayPeerId;});
                h.onEvent('callbackSrv', 'response', (args) => {
    const [res] = args;
  resolve(res);
});

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for countChars');
            })
        if(config && config.ttl) {
            r.withTTL(config.ttl)
        }
        request = r.build();
    });
    await client.initiateFlow(request!);
    return promise;
}
      
