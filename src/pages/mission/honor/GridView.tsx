import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { Fragment } from "react";
// import { useTranslation } from "react-i18next";
// import { Link, useRouteMatch } from "react-router-dom";
import { IHonorMission } from "../../../types.d";
import { useAssetI18n } from "../../../utils/i18n";
import { ContentTrans } from "../../../components/helpers/ContentTrans";
import DegreeImage from "../../../components/widgets/DegreeImage";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "5%",
    backgroundSize: "contain",
  },
  card: {
    cursor: "pointer",
  },
  header: {},
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

const GridView: React.FC<{ data?: IHonorMission }> = ({ data }) => {
  const classes = useStyles();
  // const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  // const { path } = useRouteMatch();

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rectangular" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="40%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          title={getTranslated(`honor_mission:${data.id}`, data.sentence)}
        >
          <DegreeImage
            resourceBoxId={data.rewards[0].resourceBoxId}
            type="mission_reward"
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`honor_mission:${data.id}`}
                original={data.sentence}
                originalProps={{
                  variant: "subtitle1",
                }}
                translatedProps={{
                  variant: "subtitle1",
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default GridView;
