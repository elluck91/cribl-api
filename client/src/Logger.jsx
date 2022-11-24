import React from "react";

// create a react component that displays json data from the state in a table
const Logger = ({ log }) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Text</th>
                        <th>N</th>
                        <th>Lines</th>
                    </tr>
                </thead>
                <tbody>
                    {log.map((item) => (
                        <tr key={item.filename}>
                            <td>{item.filename}</td>
                            <td>{item.text}</td>
                            <td>{item.n}</td>
                            <td>{item.lines}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Logger;