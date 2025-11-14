package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import fi.iki.elonen.NanoHTTPD

interface BaseController {
    fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response
} 