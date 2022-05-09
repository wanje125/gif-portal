import React, { useEffect, useState } from 'react';
import './Meme.css';

export default function Meme({ checkChange, isCheck, memeUserAddress, memeImage, likes, timestamp, tipClick, tipState, tipNum, tipChange, sendTip, viewerAddress, gifDelete }) {
    let clickChange = isCheck ? "noLike" : "like";
    let date = Number(timestamp * 1000);
    var time = new Date(date).toString();

    return (
        <div className="gif-item" >
            <section className="section1">
                <div className="match-grid">
                    {(memeUserAddress === viewerAddress) && (<div onClick={gifDelete} className="delete-btn"><i class="fa fa-trash" aria-hidden="true"></i></div>)}
                    <div className="first-grid">
                        <img onDoubleClick={checkChange} src={memeImage} className="image" />

                    </div>
                    <div className="payBox"> <div className="name"><p><i class="fa fa-user-circle" aria-hidden="true"></i>{memeUserAddress}</p></div>
                        <div onClick={tipClick} className="payButton">
                            Tip
                        </div></div>
                    <div className="payBox">
                        <div className="item"><p><i class="fa fa-heart" aria-hidden="true"></i>{likes} Likes</p></div>
                        {tipState && (<div>
                            <form
                                className="pay-form"

                            >
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="0.0001"
                                    max="500"
                                    className="pay-input"
                                    placeholder="0 SOL"
                                    value={tipNum}
                                    onChange={tipChange}
                                //onChange={}
                                />
                                <div onClick={sendTip} className="payButton">
                                    Send
                                </div>
                            </form></div>)}</div>
                    <div className="item"><p><i class="fa fa-calendar" aria-hidden="true"></i>Added on {time}</p></div>

                    <section id={clickChange} class="rating">
                        <input type="radio" id="heart_1" name="like" value="1" />
                        <label for="heart_1" title="Like">&#10084;</label>
                    </section>

                </div>
            </section>

        </div>
    )
}