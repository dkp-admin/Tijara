package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status

class PingController : BaseController {
    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        val response = NanoHTTPD.newFixedLengthResponse("pong")
        response.addHeader("Connection", "close")
        response.addHeader("Content-Encoding", "identity")
        response.setChunkedTransfer(false)
        return response
    }
} 