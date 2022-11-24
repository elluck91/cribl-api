// Path: client/src/InputForm.js
import React, { useState } from "react";
import Logger from "./Logger";

const InputForm = () => {
    const [filename, setFilename] = useState("");
    const [text, setText] = useState("");
    const [n, setN] = useState(0);
    const [log, setLog] = useState([]);

    // Handle input form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            filename,
            text,
            n,
        };
        console.log(formData);
        fetch("localhost:3002/lines", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setLog(data);
            });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="filename">Filename</label>
                <input
                    type="text"
                    id="filename"
                    name="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                />
                <label htmlFor="text">Text</label>
                <input
                    type="text"
                    id="text"
                    name="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <label htmlFor="n">N</label>
                <input
                    type="number"
                    id="n"
                    name="n"
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            <Logger log={log} />
        </div>
    );
};

export default InputForm;