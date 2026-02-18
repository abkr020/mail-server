const { SMTPServer } = require("smtp-server");

const server = new SMTPServer({
    
    allowInsecureAuth:true,
    authOptional:true,
    onConnect(session, cb) {
        console.log(`on connect part run -- session ${session?.id}`);
        cb()
    },
    onMailFrom(address, session, cb) {
        console.log(`on main from run. - ${address?.address}, ${session?.id}`);
        cb()
    },
    onRcptTo(address, session, cb) {
        console.log(`on rcpt to  run. - ${address?.address}, ${session?.id}`);
        cb()
    },
    onData(stream, session, cb) {
        stream.on('data', data => console.log(`on data run - ${data.toString()}`))
        stream.on('end', cb())

    }
});


server.listen(25, () => { console.log('--| smpt server running on th epor t o 25 |--') })