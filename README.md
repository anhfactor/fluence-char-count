### Fluence Character count (Grants Round 11 Hackathon - Fluence)
##### Follow The Fluence Quickstart Guide (Beginner)
###### Description
Extend the Fluence Quickstart, https://github.com/fluencelabs/examples/tree/main/quickstart/3-browser-to-service, with a distributed character count service deployed to at least one Fluence peer. Display a message's character count at the end of the message, e.g., (char count: 123 chars). You should accurately count characters.

*browser-to-service* example. e.g., (char count: 123 chars).

### Creating the WebAssembly module for char-count service

Based on `2-hosted-services` example the following service was created:

```rust
// src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}

#[marine]
pub struct CharCount {
    pub msg: String,
    pub count: String,
}

#[marine]
pub fn char_count(msg: String) -> CharCount {
    CharCount {
        msg: format!("{}", msg),
        count: format!("{} chars", msg.len()),
    }
}
```
where you can see that the `char_count` function return a structure `CharCount` with the message and the char count.

Run `./scripts/build.sh` to compile the code to the Wasm target from the VSCode terminal.


### Tests

A couple of test were created in our `main.rs` file:

```rust
// quickstart/4-char-count-service/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

//<snip>

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_0(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("".to_string());
        assert_eq!(actual.msg, "");
        assert_eq!(actual.count, "0 chars");
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_2(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("at".to_string());
        assert_eq!(actual.msg, "at");
        assert_eq!(actual.count, "2 chars");
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_space(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("at aqua".to_string());
        assert_eq!(actual.count, "7 chars");
    }
}

```
For tests running use the`cargo +nightly test --release` command. 

### Run  [Marine REPL] to locally validate

In your VSCode terminal the `4-char-count-service` directory run:

```text
mrepl configs/Config.toml
```

which puts us in the REPL:

```bash
mrepl configs/Config.toml
Welcome to the Marine REPL (version 0.9.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = be5f342c-904b-4182-a09b-47342923419e
elapsed time 54.381794ms

1> interface
Loaded modules interface:
data CharCount:
  msg: string
  count: string

char_count:
  fn char_count(msg: string) -> CharCount

2> call char_count char_count ["At Fluence"]
result: Object({"count": String("10 chars"), "msg": String("At Fluence")})
 elapsed time: 185.709µs

3> quit
```

### Exporting WebAssembly Interfaces To Aqua


```text
marine aqua artifacts/char_count.wasm
```

Which gives us the Aqua-ready interfaces:

```haskell
module CharCount declares *

data CharCount:
  msg: string
  count: string

service CharCount:
  char_count(msg: string) -> CharCount
```

### Deploying the Wasm Module To The Network

To get a peer from one of the Fluence testnets use `fldist`. 

```text
fldist env
```
Let's use the peer`12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e`

```bash
fldist --node-id 12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e \
       new_service \
       --ms artifacts/char_count.wasm:configs/char_count_cfg.json \
       --name char-count-br
```

Which gives us a unique service id:

```text
service id: 32e7f3e6-9f1e-4140-8281-c58bc4e59440
service created successfully
```

Take note of the service id, `service id: d55b947f-a8ca-45cc-a53b-a243b34294da` will be use in `3-browser-to-serive`

## Update 3-browser-to-service

Update 3-browser-to-service to show char count the message. Go to `3-browser-to-service`

### Update aqua whit the new service


```
import "@fluencelabs/aqua-lib/builtin.aqua"

const nodePeerId ?= "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e"
const serviceId ?= "32e7f3e6-9f1e-4140-8281-c58bc4e59440"

data CharCount:
  msg: string
  reply: string

-- The service runs on a Fluence node
service CharCount:
    char_count(from: PeerId) -> CharCount

-- The service runs inside browser
service CharCountPeer("CharCountPeer"):
    char_count(message: string) -> string

func countChars(messageToSend: string, targetPeerId: PeerId, targetRelayPeerId: PeerId) -> string:
    -- execute computation on a Peer in the network
    on nodePeerId:
        CharCount serviceId
        comp <- CharCount.char_count(messageToSend)

    -- send the result to target browser in the background
    co on targetPeerId via targetRelayPeerId:
        res <- CharCountPeer.char_count(messageToSend)

    -- send the result to the initiator
    <- comp.reply
```

### Run install first
```
npm install
```

### Compile aqua file
```
npm run compile-aqua
```

### Update App.tsx

In order to use the new service and display de char count you should update this file as is done in `3-browser-to-service/src/App.tsx

### Run the application 

```text
npm start
```

### Play with the app

Which will open a new browser tab at `http://localhost:3000` . Following the instructions, we connect to any one of the displayed relay ids, open another browser tab also at  `http://localhost:3000`, select a relay and copy and  paste the client peer id and relay id into corresponding fields in the first tab and press the `Say Hello` button.

You will see the message and char count for this message

