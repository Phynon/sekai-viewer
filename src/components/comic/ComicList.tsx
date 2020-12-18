import {
  Button,
  ButtonGroup,
  Container,
  Grid,
  Link,
  Typography,
} from "@material-ui/core";
import { Twitter } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Vk } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { SettingContext } from "../../context";
import { useLayoutStyles } from "../../styles/layout";
import { ITipInfo, ITipInfoComic } from "../../types";
import { getRemoteAssetURL, useCachedData, useRefState } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import InfiniteScroll from "../subs/InfiniteScroll";
import GridView from "./GridView";

const ListCard: React.FC<{
  data?: ITipInfoComic;
  index?: number;
  lang?: string;
  handleCardClick?: (index: number) => void;
}> = GridView;

const ComicList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const { getTranslated } = useAssetI18n();

  const [tipsCache] = useCachedData<ITipInfo>("tips");

  const [comics, setComics] = useState<ITipInfoComic[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    ITipInfoComic[]
  >([]);

  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [resourceLang, setResourceLang] = useState<
    "ja" | "fr" | "ru" | "zhs" | "zht"
  >("ja");
  const [comicImages, setComicImages] = useState<ImageDecorator[]>([]);

  const getPaginatedTips = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  useEffect(() => {
    const f = async () => {
      const images: ImageDecorator[] = [];
      for (let comic of filteredCache) {
        let url;
        switch (resourceLang) {
          case "ja":
            url = `comic/one_frame_rip/${comic.assetbundleName}.webp`;
            break;
          default:
            url = `comic_${resourceLang}/${comic.assetbundleName}.png`;
            break;
        }
        images.push({
          src: await getRemoteAssetURL(url),
          alt: getTranslated(
            contentTransMode,
            `comic_title:${comic.id}`,
            comic.title
          ),
          downloadUrl: await getRemoteAssetURL(url),
        });
      }
      setComicImages(images);
    };

    f();
  }, [filteredCache, contentTransMode, getTranslated, resourceLang]);

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!filteredCacheRef.current.length ||
        filteredCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      filteredCacheRef.current.length &&
      filteredCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    document.title = t("title:comicList");
  }, [t]);

  useEffect(() => {
    if (tipsCache.length) {
      const filtered = tipsCache.filter(
        (tip): tip is ITipInfoComic => "assetbundleName" in tip
      );
      setFilteredCache(filtered);
      setComics([]);
      setPage(0);
    }
  }, [tipsCache, setComics, setPage, setFilteredCache]);

  useEffect(() => {
    setComics((tips) => [...tips, ...getPaginatedTips(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, tipsCache, setLastQueryFin, getPaginatedTips]);

  useEffect(() => {
    setIsReady(Boolean(tipsCache.length));
  }, [setIsReady, tipsCache]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:comic")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
          <ButtonGroup style={{ marginBottom: "1%" }}>
            <Button
              size="medium"
              color={resourceLang === "ja" ? "secondary" : "primary"}
              onClick={() => setResourceLang("ja")}
            >
              <Typography>JA</Typography>
            </Button>
            <Button
              size="medium"
              color={resourceLang === "fr" ? "secondary" : "primary"}
              onClick={() => setResourceLang("fr")}
            >
              <Typography>FR</Typography>
            </Button>
            <Button
              size="medium"
              color={resourceLang === "ru" ? "secondary" : "primary"}
              onClick={() => setResourceLang("ru")}
            >
              <Typography>RU</Typography>
            </Button>
            <Button
              size="medium"
              color={resourceLang === "zhs" ? "secondary" : "primary"}
              onClick={() => setResourceLang("zhs")}
            >
              <Typography>简</Typography>
            </Button>
            <Button
              size="medium"
              color={resourceLang === "zht" ? "secondary" : "primary"}
              onClick={() => setResourceLang("zht")}
            >
              <Typography>繁</Typography>
            </Button>
          </ButtonGroup>
        </Grid>
        {resourceLang === "fr" ? (
          <Alert severity="info">
            <Typography>
              Credit: Yasito (
              <Link
                href="https://twitter.com/pjsekai_fra"
                style={{ textDecorationLine: "none" }}
              >
                <Twitter fontSize="inherit" /> @pjsekai_fra
              </Link>
              )
            </Typography>
          </Alert>
        ) : resourceLang === "ru" ? (
          <Alert severity="info">
            <Typography>
              Credit:
              <Link
                href="https://vk.com/pjsekai_ru"
                style={{ textDecorationLine: "none" }}
              >
                <Vk fontSize="inherit" /> Project SEKAI Russian Group
              </Link>
            </Typography>
          </Alert>
        ) : resourceLang === "zhs" ? (
          <Alert severity="info">
            <Typography>
              Credit:
              <Link
                href="https://space.bilibili.com/13148307/"
                style={{ textDecorationLine: "none" }}
              >
                Project_SEKAI资讯站@bilibili
              </Link>
            </Typography>
          </Alert>
        ) : resourceLang === "zht" ? (
          <Alert severity="info">
            <Typography>Credit: CHKO</Typography>
          </Alert>
        ) : null}
        <InfiniteScroll<ITipInfoComic>
          ViewComponent={ListCard}
          callback={callback}
          data={comics}
          gridSize={{
            xs: 12,
            md: 4,
            lg: 3,
          }}
          viewProps={{
            lang: resourceLang,
            handleCardClick: (index: number) => {
              setActiveIdx(index);
              setVisible(true);
            },
          }}
        />
      </Container>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={comicImages}
        zIndex={2000}
        activeIndex={activeIdx}
        downloadable
        downloadInNewWindow
        onMaskClick={() => setVisible(false)}
        onChange={(_, idx) => setActiveIdx(idx)}
        zoomSpeed={0.25}
      />
    </Fragment>
  );
};

export default ComicList;
