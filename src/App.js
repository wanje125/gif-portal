import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
    Program, Provider, web3
} from '@project-serum/anchor';
import { Buffer } from 'buffer';
import kp from './keypair.json'

import idl from './idl.json';
import { nanoid } from 'nanoid';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

window.Buffer = Buffer;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
    preflightCommitment: "processed"
}


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
    'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
    'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
    'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
    'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'

]


const App = () => {
    /*
    * This function holds the logic for deciding if a Phantom Wallet is
    * connected or not
    */
    const [walletAddress, setWalletAddress] = useState(null);
    const [gifCheck, setGifCheck] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [gifList, setgifList] = useState([]);
    const [tipValue, setTipValue] = useState();

    // 판톰 wallet이 있는지 찾는다. 있으면 useState에서 walletAddress를 사용자의 wallet pubkey로 바꾼다.
    // 아래에서 useEffect로 checkIfWalletIsConnected인지 처음만 확인한다. 그 뒤에는 connectWallet 함수를 사용하는듯 하다. 
    const checkIfWalletIsConnected = async () => {
        try {
            const { solana } = window; // 웹에서 window document에서 solana를 찾을 수 있다.
            window.Buffer = Buffer;
            console.log(window);
            console.log({ solana });
            if (solana) { //만약 solana가 있으면 판톰월렛이 있는지 찾는다. 다른 월렛 연결도 필요한지는 모르겠다.
                if (solana.isPhantom) {
                    console.log('Phantom wallet found!');
                    const response = await solana.connect({ onlyIfTrusted: true }); // 판톰과 연결한다. 
                    console.log(
                        'Connected with Public Key;',
                        response.publicKey.toString()
                    );
                    setWalletAddress(response.publicKey.toString()); //useState에서 walletAddress를 ()의 값으로 바꾼다. 즉, client의 wallet address
                }
            } else {
                alert('Solana object not found! Get a Phantom Wallet')
            }
        } catch (error) {
            console.error(error);
        }
    };
    //처음에는 checkWalletIsConnected를 사용하지만 나중에는 이걸 쓰는듯하다. 
    const connectWallet = async () => {
        const { solana } = window;

        if (solana) {
            const response = await solana.connect();
            console.log('Connected with Public Key:', response.publicKey.toString());
            setWalletAddress(response.publicKey.toString());
        }
    };

    

    const sendGif = async () => {
        if (inputValue.length === 0) { //inputValue는 gif를 입력하는 칸이다. submit버튼을 눌렀는데 아무것도 없으면 gif가 없다고 반환한다. 
            console.log("No gif link given!")
            return
        }
        setInputValue(''); //우선 그전에 남아있을 수 있는 inputValue를 초기화한다. 
        console.log('Gif link:', inputValue);
        try {
            const provider = getProvider(); //Returns the default provider being used by the client. The network and wallet context to use. If not provided then uses getProvider.
            const program = new Program(idl, programID, provider); // anchor에서 Program은 온체인 프로그램과의 통신과 관련된 모든 것을 관리한다.
            //트랜잭션을 보내고, 역직렬화된 계정을 가져오고, instructioin 데이터를 디코딩하고, 계정 변경 사항을 컨펌하고, 이벤트를 수신할 수 있다.
            const memeId = await nanoid(); // 랜덤으로 유니크한 키를 만든다. ex a5c8f7d9e1m2c3s5
            await program.rpc.addGif(inputValue, false, false, "0", memeId { // nanoid 참조 https://velog.io/@lifeisbeautiful/React-nanoid-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
                accounts: {
                    baseAccount: baseAccount.publicKey, //start_stuff_off에서는 program을 넣어줬지만 여기서는 굳이 필요없어서 rust에서도 삭제해도 된다.
                    user: provider.wallet.publicKey, // 앞에서 provider은 client의 network와 wallet 정보를 가지고 온다고 했다.
                },
            });
            console.log("GIF successfully sent to program", inputValue)

            await getGifList();
        } catch (error) {
            console.log("Error sending GIF:", error)
        }
    };

    const renderNotConnectedContainer = () => ( // wallet이 connect 되지않았을때의 page를 rendering한다. 
        <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
        >
            Connect to Wallet
        </button>
    );

    const renderConnectedContainer = () => { //wallet이 connect 되었을떄 page를 rendering한다. 
        // If we hit this, it means the program account hasn't been initialized.
        if (gifList === null) {
            return (
                <div className="connected-container">
                    <button className="cta-button submit-gif-button" onClick={createGifAccount}> {/* 러스트의 startStuffOff 실행, 데이터 저장을 위한 account가 없다는 뜻 program의 account를 가져오고 user의 account를 signer로 받아옴 */}
                        Do One-Time Initialization For GIF Program Account
                    </button>
                </div>
            )
        }
        // Otherwise, we're good! Account exists. User can submit GIFs.
        else {
            return (
                <div className="connected-container">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendGif();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Enter gif link!"
                            value={inputValue}
                            onChange={onInputChange}
                        />
                        <button type="submit" className="cta-button submit-gif-button">
                            Submit
                        </button>
                    </form>
                    <div className="gif-grid">
                        {/* We use index as the key instead, also, the src is now item.gifLink */}
                        {gifList.map((item, index) => (
                            <div className="gif-item" key={index}>
                                <img src={item.gifLink} />
                                <p className='sub-text'>
                                    {item.userAddress.toString()}
                                </p>
                                {/*<div>
                                    {like ?
                                        <HeartFilled className="button red" onClick={likeChange} /> :
                                        <HeartOutlined className="button" onClick={likeChange} />}
                                </div>
                                {item.upvote}*/}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    const onInputChange = (event) => {
        const { value } = event.target;
        setInputValue(value);
    };

 /*   const likeChange = () => {
        if (like) {
            setLike(false);
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            });
            gifList.upvote -= 1;
        } else {
            setLike(true);
            gifList.upvote -= 1;
        };
    }
*/
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new Provider(
            connection, window.solana, opts.preflightCommitment,
        );
        return provider;
    };

    const createGifAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            console.log("ping")
            console.info(program.rpc)
            await program.rpc.startStuffOff({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
            await getGifList();

        } catch (error) {
            console.log("Error creating BaseAccount account:", error)
        }
    }

    /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */


    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener('load', onLoad); // 'load' event는 페이지의 전체 부분이 다 load되면 fire한다. 아마 새로고침 할떄도 새로 fire되는듯 하다.
        return () => window.removeEventListener('load', onLoad);
    }, []);

    const getGifList = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

            console.log("Got the account", account)
            setGifList(account.gifList)

        } catch (error) {
            console.log("Error in getGifList: ", error)
            setGifList(null);
        }
    }

    useEffect(() => {
        if (walletAddress) {
            console.log('Fetching GIF list...');
            getGifList()
        }
    }, [walletAddress]);
    /*
 * Let's define this method so our code doesn't break.
 * We will write the logic for this next!

setGifCheck(gifList.check);
*/

  return (
      <div className="App">
          {/* This was solely added for some styling fanciness */}
          <div className={walletAddress ? 'authed-container' : 'container'}>
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
            {/* Render your connect to wallet button right here wallet이 없으면 renderNotConnectedContainer 호출 */}
            {!walletAddress && renderNotConnectedContainer()} {/* &&은 and인데 이렇게 쓰면 깔끔한 코드가 된다. */}
            {/* We just need to add the inverse here! wallet이 있으면 renderConnectedContainer 호출 */}
            {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
    </div>
  );
};

export default App;