import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Provider as ReduxProvider } from "react-redux";
import { RTL } from "src/components/rtl";
import { SettingsDrawer } from "src/components/settings/settings-drawer";
import { SplashScreen } from "src/components/splash-screen";
import { Toaster } from "src/components/toaster";
import { gtmConfig } from "src/config";
import { AuthConsumer, AuthProvider } from "src/contexts/auth/jwt-context";
import {
  SettingsConsumer,
  SettingsProvider,
} from "src/contexts/settings-context";
import { useAnalytics } from "src/hooks/use-analytics";
import { useNProgress } from "src/hooks/use-nprogress";
import { store } from "src/store";
import { createTheme } from "src/theme";
import { createEmotionCache } from "src/utils/create-emotion-cache";
// Remove if react-quill is not used
import "react-quill/dist/quill.snow.css";
// Remove if react-draft-wysiwyg is not used
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// Remove if simplebar is not used
import "simplebar-react/dist/simplebar.min.css";
// Remove if mapbox is not used
import "mapbox-gl/dist/mapbox-gl.css";
// Remove if locales are not used
import { QueryClient, QueryClientProvider } from "react-query";
import NoInternetConnection from "src/components/no-internet-connection";
import { UserTypeProvider } from "src/contexts/user-type-context";
import "../locales/i18n";
// import "../i18n";
import "whatwg-fetch";

const clientSideEmotionCache = createEmotionCache();
const queryClient = new QueryClient();

const App = (props: AppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useAnalytics(gtmConfig);
  useNProgress();

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>Tijarah</title>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width, maximum-scale=1"
            />
          </Head>

          <NoInternetConnection />

          <ReduxProvider store={store}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <AuthProvider>
                <UserTypeProvider>
                  <AuthConsumer>
                    {(auth) => (
                      <SettingsProvider>
                        <SettingsConsumer>
                          {(settings) => {
                            // Prevent theme flicker when restoring custom settings from browser storage
                            if (!settings.isInitialized) {
                              // return null;
                            }

                            const theme = createTheme({
                              colorPreset: settings.colorPreset,
                              contrast: settings.contrast,
                              direction: settings.direction,
                              paletteMode: settings.paletteMode,
                              responsiveFontSizes: settings.responsiveFontSizes,
                            });

                            // Prevent guards from redirecting
                            const showSlashScreen = !auth.isInitialized;

                            return (
                              <ThemeProvider theme={theme}>
                                {/* <ColorSchemes> */}
                                <Head>
                                  <meta
                                    name="color-scheme"
                                    content={settings.paletteMode}
                                  />
                                  <meta
                                    name="theme-color"
                                    content={theme.palette.neutral[900]}
                                  />
                                </Head>
                                <RTL direction={settings.direction}>
                                  <CssBaseline />
                                  {showSlashScreen ? (
                                    <SplashScreen />
                                  ) : (
                                    <>
                                      {getLayout(<Component {...pageProps} />)}
                                      {/* <SettingsButton
                                        onClick={settings.handleDrawerOpen}
                                      /> */}
                                      <SettingsDrawer
                                        canReset={settings.isCustom}
                                        onClose={settings.handleDrawerClose}
                                        onReset={settings.handleReset}
                                        onUpdate={settings.handleUpdate}
                                        open={settings.openDrawer}
                                        values={{
                                          colorPreset: settings.colorPreset,
                                          contrast: settings.contrast,
                                          direction: settings.direction,
                                          paletteMode: settings.paletteMode,
                                          responsiveFontSizes:
                                            settings.responsiveFontSizes,
                                          stretch: settings.stretch,
                                          layout: settings.layout,
                                          navColor: settings.navColor,
                                          userType: settings.userType,
                                          isSystem: settings.isSystem,
                                        }}
                                      />
                                    </>
                                  )}
                                  <Toaster />
                                </RTL>
                                {/* </ColorSchemes> */}
                              </ThemeProvider>
                            );
                          }}
                        </SettingsConsumer>
                      </SettingsProvider>
                    )}
                  </AuthConsumer>
                </UserTypeProvider>
              </AuthProvider>
            </LocalizationProvider>
          </ReduxProvider>
        </CacheProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
