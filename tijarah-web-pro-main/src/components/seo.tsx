import type { FC } from "react";
import Head from "next/head";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

interface SeoProps {
  title?: string;
}

export const Seo: FC<SeoProps> = (props) => {
  const { t } = useTranslation();

  const { title } = props;

  const fullTitle = title ? title + t(" | Tijarah") : t("Tijarah");

  return (
    <Head>
      <title>{fullTitle}</title>
    </Head>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
};
