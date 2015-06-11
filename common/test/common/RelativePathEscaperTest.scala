package common

import conf.Static
import org.scalatest.{Matchers, FlatSpec}
import org.scalatestplus.play.OneAppPerSuite

class RelativePathEscaperTest extends FlatSpec with Matchers with OneAppPerSuite {
  "RelativePathEscaper" should "escape path-like json in football config references data" in {
    val jsonFootballRefs = "\"references\":[{\"paFootballTeam\":\"13\"},{\"esaFootballTeam\":\"/football/team/32\"},{\"paFootballCompetition\":\"101\"},{\"esaFootballTeam\":\"/football/team/9\"},{\"optaFootballTournament\":\"10/2012\"},{\"paFootballTeam\":\"28\"},{\"optaFootballTeam\":\"2\"},{\"esaFootballTournament\":\"/football/tournament/div1\"},{\"optaFootballTeam\":\"103\"}]"
    val escapedJson = RelativePathEscaper.escapeLeadingSlashFootballPaths(jsonFootballRefs)
    escapedJson should not include ("""":"/football/team/32"""")
    escapedJson should include (""":"/" + "football/" + "team/" + "32"""")
    escapedJson should not include ("""":"/football/tournament/div1"""")
    escapedJson should include (""":"/" + "football/" + "tournament/" + "div1"""")
  }
}
