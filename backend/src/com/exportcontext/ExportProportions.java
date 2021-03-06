package com.exportcontext;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.Vector;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet implementation class JDBCTest
 */
@WebServlet("/services/ExportProportions")
public class ExportProportions extends HttpServlet {
	private static final long serialVersionUID = 1L;
	

    /**
     * Default constructor. 
     */
    public ExportProportions() {
    }
    
    public String getTitle(String desc, String level, int offset, int max, int year){
    	String title = Integer.toString(year);
    	String newDesc = "";
    	
    	if(desc == null)
    		desc = "All Exports";
    	
    	final int descLimit = 100;
    	if(desc.length() < descLimit){
    		newDesc = desc;
    	}
    	else{
    		newDesc = desc.substring(0, descLimit).trim() + "...";
    	}
    	
    	if(level.equals("2"))
    		title = "HS-2 (High Level) Data";
    	else if(level.equals("4")){
    		title = "HS-4 (Mid Level) Data for " + newDesc;    		
    	}
    	else{
    		title = "HS-6 (Low Level) Data for " + newDesc;    		
    	}
    	
    	title += " Top " + offset + " to " + max + " Categories";
    	
    	return title;
    	
    }
    
    public String getDrillDownURI(String desc, String origDesc, String level, int max, int year, int country) throws UnsupportedEncodingException{
    	String linkLevel = "2";
    	String newDesc = "";
    	String postFix = "";
    	if(country != -1){
    		postFix = "&country=" + country;
    	}
    	
    	if(desc.equals("Other")){
    		linkLevel = level;
        	int newOffset = max + 1;
        	int newMax = newOffset + 9;
        	if(origDesc != null){
        		newDesc=URLEncoder.encode(origDesc, "UTF-8");
        		return "ExportProportions?year="+year+"&offset="+ newOffset +"&max=" + newMax + "&level="+linkLevel+"&query=" + newDesc + postFix;
        	}
        	else
        		return "ExportProportions?year="+year+"&offset="+ newOffset +"&max=" + newMax + "&level="+linkLevel + postFix;
    	}
    	else{
    		if(level.equals("6")){
        		return "";
        	}
    		newDesc=URLEncoder.encode(desc, "UTF-8");
        	if(level.equals("2"))
        		linkLevel = "4";
        	else if(level.equals("4"))
        		linkLevel = "6";
    		return "ExportProportions?year="+year+"&offset=0&max=10&level="+linkLevel+"&query=" + newDesc + postFix;
    	}
    }
    
    public String getGeoURI(String desc, String level, int year) throws UnsupportedEncodingException{
    	return "ExportGeos?territory=World&include_us=true&year="+ year +
    				"&hs_level="+level+
    				"&hs_category="+URLEncoder.encode(desc, "UTF-8");
    	
    }
    
    private PreparedStatement getMainStatementUSState(Connection conn, int year, int offset, int max, String level,
			String query, String state) throws SQLException {
		final String hs2Select = 	
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_2_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL, GEOS GEO \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND ED.GEO = 1 \n " +
				"        AND GEO.STATE_CODE = ? \n " +
				"        AND ED.COUNTRY = 9 \n " +
				"		 AND ED.COUNTRY = GEO.COUNTRY \n" +
				"		 AND ED.STATE = GEO.STATE \n" +
				"		 AND GEO.STATE_CODE IS NOT NULL \n" +
				"        GROUP BY CL.HS_2_DESC, ED.year \n " +
				"), \n " +
				"summary AS ( \n " +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank \n " +
				"    FROM ( \n " +
				"        SELECT HS_2_DESC as desc, SUM(VALUE) AS value \n " +
				"	 FROM EXP_COUNTRY \n " +
				"        WHERE YEAR = ? \n " +
				"        GROUP BY HS_2_DESC \n " +
				"    ) p \n " +
				"), \n " +
				"total AS ( \n " +
				"    SELECT SUM(VALUE) as value \n " +
				"    FROM EXP_COUNTRY \n " +
				"    WHERE YEAR = ? \n " +
				") \n " +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank \n " +
				"  FROM summary s1, total t1 \n " +
				"  WHERE s1.rank <= ? and s1.rank >= ? \n " +
				"UNION ALL \n " +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1 \n " +
				"    FROM summary s2, total t2 \n " +
				"   WHERE s2.rank > ? \n " +
				"  GROUP BY t2.value \n " +
				"ORDER BY rank \n ";
		
		final String hs4Select =
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_4_DESC, \n " +
				"        CL.HS_2_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL, GEOS GEO \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND ED.GEO = 1 \n " +
				"        AND GEO.STATE_CODE = ? \n " +
				"        AND ED.COUNTRY = 9 \n " +
				"		 AND ED.COUNTRY = GEO.COUNTRY \n" +
				"		 AND ED.STATE = GEO.STATE \n" +
				"		 AND GEO.STATE_CODE IS NOT NULL \n" +
				"        GROUP BY CL.HS_4_DESC, CL.HS_2_DESC, ED.year \n " +
				"), \n " +
				"summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_4_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM EXP_COUNTRY\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_2_DESC=?\n" +
				"        GROUP BY HS_4_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM EXP_COUNTRY\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_2_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		final String hs6Select = 	
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_4_DESC, \n " +
				"        CL.english_description as HS_6_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL, GEOS GEO \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND ED.GEO = 1 \n " +
				"        AND GEO.STATE_CODE = ? \n " +
				"        AND ED.COUNTRY = 9 \n " +
				"		 AND ED.COUNTRY = GEO.COUNTRY \n" +
				"		 AND ED.STATE = GEO.STATE \n" +
				"		 AND GEO.STATE_CODE IS NOT NULL \n" +
				"        GROUP BY CL.HS_4_DESC, CL.english_description, ED.year \n " +
				"), \n " +
				"summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_6_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM EXP_COUNTRY\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_4_DESC=?\n" +
				"        GROUP BY HS_6_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM EXP_COUNTRY\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_4_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		PreparedStatement stmt;
		
		if(level.equals("6")){
			stmt = conn.prepareStatement(hs6Select);

			stmt.setString(1, state);
			stmt.setInt(2, year);
			stmt.setString(3, query);
			stmt.setInt(4, year);
			stmt.setString(5, query);
			stmt.setInt(6, max);
			stmt.setInt(7, offset);
			stmt.setInt(8, max);
			stmt.setInt(9, max);
			
		}
		else if(level.equals("4")){
			stmt = conn.prepareStatement(hs4Select);

			stmt.setString(1, state);
			stmt.setInt(2, year);
			stmt.setString(3, query);
			stmt.setInt(4, year);
			stmt.setString(5, query);
			stmt.setInt(6, max);
			stmt.setInt(7, offset);
			stmt.setInt(8, max);
			stmt.setInt(9, max);
		}
		else{
			stmt = conn.prepareStatement(hs2Select);
			
			stmt.setString(1, state);
			stmt.setInt(2, year);
			stmt.setInt(3, year);
			stmt.setInt(4, max);
			stmt.setInt(5, offset);
			stmt.setInt(6, max);
			stmt.setInt(7, max);				
		}
		return stmt;
	}
    
	private PreparedStatement getMainStatement(Connection conn, int year, int offset, int max, String level,
			String query, int country) throws SQLException {
		final String hs2Select = 	
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_2_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND GEO = 1 \n " +
				"        AND STATE = 1000 \n " +
				"        AND COUNTRY = ? \n " +
				"        GROUP BY CL.HS_2_DESC, ED.year \n " +
				"), \n " +
				"summary AS ( \n " +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank \n " +
				"    FROM ( \n " +
				"        SELECT HS_2_DESC as desc, SUM(VALUE) AS value \n " +
				"	 FROM EXP_COUNTRY \n " +
				"        WHERE YEAR = ? \n " +
				"        GROUP BY HS_2_DESC \n " +
				"    ) p \n " +
				"), \n " +
				"total AS ( \n " +
				"    SELECT SUM(VALUE) as value \n " +
				"    FROM EXP_COUNTRY \n " +
				"    WHERE YEAR = ? \n " +
				") \n " +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank \n " +
				"  FROM summary s1, total t1 \n " +
				"  WHERE s1.rank <= ? and s1.rank >= ? \n " +
				"UNION ALL \n " +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1 \n " +
				"    FROM summary s2, total t2 \n " +
				"   WHERE s2.rank > ? \n " +
				"  GROUP BY t2.value \n " +
				"ORDER BY rank \n ";
		
		final String hs4Select =
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_4_DESC, \n " +
				"        CL.HS_2_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND GEO = 1 \n " +
				"        AND STATE = 1000 \n " +
				"        AND COUNTRY = ? \n " +
				"        GROUP BY CL.HS_4_DESC, CL.HS_2_DESC, ED.year \n " +
				"), \n " +
				"summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_4_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM EXP_COUNTRY\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_2_DESC=?\n" +
				"        GROUP BY HS_4_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM EXP_COUNTRY\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_2_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		final String hs6Select = 	
				"WITH EXP_COUNTRY AS (\n " +
				"        SELECT \n " +
				"        CL.HS_4_DESC, \n " +
				"        CL.english_description as HS_6_DESC, \n " +
				"        SUM(VALUE) AS VALUE, \n " +
				"        ED.year \n " +
				"        FROM EXPORT_DATA ED, CODE_LOOKUP CL \n " +
				"        WHERE ED.HS_CODE = CL.CODE \n " +
				"        AND GEO = 1 \n " +
				"        AND STATE = 1000 \n " +
				"        AND COUNTRY = ? \n " +
				"        GROUP BY CL.HS_4_DESC, CL.english_description, ED.year \n " +
				"), \n " +
				"summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_6_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM EXP_COUNTRY\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_4_DESC=?\n" +
				"        GROUP BY HS_6_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM EXP_COUNTRY\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_4_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		PreparedStatement stmt;
		
		if(level.equals("6")){
			stmt = conn.prepareStatement(hs6Select);

			stmt.setInt(1, country);
			stmt.setInt(2, year);
			stmt.setString(3, query);
			stmt.setInt(4, year);
			stmt.setString(5, query);
			stmt.setInt(6, max);
			stmt.setInt(7, offset);
			stmt.setInt(8, max);
			stmt.setInt(9, max);
			
		}
		else if(level.equals("4")){
			stmt = conn.prepareStatement(hs4Select);

			stmt.setInt(1, country);
			stmt.setInt(2, year);
			stmt.setString(3, query);
			stmt.setInt(4, year);
			stmt.setString(5, query);
			stmt.setInt(6, max);
			stmt.setInt(7, offset);
			stmt.setInt(8, max);
			stmt.setInt(9, max);
		}
		else{
			stmt = conn.prepareStatement(hs2Select);
			
			stmt.setInt(1, country);
			stmt.setInt(2, year);
			stmt.setInt(3, year);
			stmt.setInt(4, max);
			stmt.setInt(5, offset);
			stmt.setInt(6, max);
			stmt.setInt(7, max);				
		}
		return stmt;
	}

	private PreparedStatement getMainStatement(Connection conn, int year, int offset, int max, String level,
			String query) throws SQLException {
		final String hs2Select = 	
				"WITH summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_2_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM HS2_PRECOMP\n" +
				"        WHERE YEAR = ?\n" +
				"        GROUP BY HS_2_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM HS2_PRECOMP\n" +
				"    WHERE YEAR = ?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		final String hs4Select = 	
				"WITH summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_4_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM HS4_PRECOMP\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_2_DESC=?\n" +
				"        GROUP BY HS_4_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM HS4_PRECOMP\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_2_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		final String hs6Select = 	
				"WITH summary AS ( \n" +
				"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
				"    FROM (\n" +
				"        SELECT HS_6_DESC as desc, SUM(VALUE) AS value\n" +
				"	 FROM HS6_PRECOMP\n" +
				"        WHERE YEAR = ?\n" +
				"        AND HS_4_DESC=?\n" +
				"        GROUP BY HS_6_DESC\n" +
				"    ) p\n" +
				"),\n" +
				"total AS(\n" +
				"    SELECT SUM(VALUE) as value\n" +
				"    FROM HS6_PRECOMP\n" +
				"    WHERE YEAR = ?\n" +
				"    AND HS_4_DESC=?\n" +
				")\n" +
				"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
				"  FROM summary s1, total t1\n" +
				"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
				"UNION ALL\n" +
				"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
				"    FROM summary s2, total t2\n" +
				"   WHERE s2.rank > ?\n" +
				"  GROUP BY t2.value\n" +
				"ORDER BY rank ";
		
		PreparedStatement stmt;
		
		if(level.equals("6")){
			stmt = conn.prepareStatement(hs6Select);
			
			stmt.setInt(1, year);
			stmt.setString(2, query);
			stmt.setInt(3, year);
			stmt.setString(4, query);
			stmt.setInt(5, max);
			stmt.setInt(6, offset);
			stmt.setInt(7, max);
			stmt.setInt(8, max);
			
		}
		else if(level.equals("4")){
			stmt = conn.prepareStatement(hs4Select);
			
			stmt.setInt(1, year);
			stmt.setString(2, query);
			stmt.setInt(3, year);
			stmt.setString(4, query);
			stmt.setInt(5, max);
			stmt.setInt(6, offset);
			stmt.setInt(7, max);
			stmt.setInt(8, max);
		}
		else{
			stmt = conn.prepareStatement(hs2Select);
			
			stmt.setInt(1, year);
			stmt.setInt(2, year);
			stmt.setInt(3, max);
			stmt.setInt(4, offset);
			stmt.setInt(5, max);
			stmt.setInt(6, max);				
		}
		return stmt;
	}
    
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json");
		
		InitialContext cxt;
		try {
			cxt = new InitialContext();

			DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );
			Connection conn = ds.getConnection();
			
			PrintWriter wr = response.getWriter();
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			String yearStr = request.getParameter("year");
			int year;
			String offsetStr = request.getParameter("offset");
			int offset;
			String maxStr = request.getParameter("max");
			int max;
			String level = request.getParameter("level");
			String query = request.getParameter("query");
			
			if(yearStr == null || offsetStr == null || maxStr == null || level == null){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			
			if(yearStr.matches("[0-9]+") && 
					offsetStr.matches("[0-9]+") && 
					maxStr.matches("[0-9]+") &&
					level.matches("[246]")
					){
				year = Integer.parseInt(yearStr);
				offset = Integer.parseInt(offsetStr);
				max = Integer.parseInt(maxStr);
			}
			else{
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			
			if((level.equals("4") || level.equals("6")) && query == null){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			int country = -1;
			PreparedStatement stmt;
			if(request.getParameter("country") != null){
				country = Integer.parseInt(request.getParameter("country"));
				stmt = getMainStatement(conn, year, offset, max, level, query, country);
			}
			else if(request.getParameter("us_state") != null){
				stmt = getMainStatementUSState(conn, year, offset, max, level, query, request.getParameter("us_state"));
			}
			else{
				stmt = getMainStatement(conn, year, offset, max, level, query);
			}
			
			ResultSet rs = stmt.executeQuery();
					
			ResultSetMetaData md = rs.getMetaData();
			String[] collHeader = new String[md.getColumnCount() + 2];
			collHeader[collHeader.length - 2] = "drillDownURI";
			collHeader[collHeader.length - 1] = "geoDataURI";
			
			for(int i = 1; i <= md.getColumnCount(); i++){
				collHeader[i - 1] = md.getColumnLabel(i);
			}
			wr.println("{ \"title\":" + gson.toJson(getTitle(query, level, offset, max, year))
					+ ", \n\"data\": [");
			wr.println(gson.toJson(collHeader));
			
			long totalVal = 0; 
			
			while(rs.next()){
				wr.print(",");
				
				Object[] data = new Object[md.getColumnCount() + 2];
				String desc = rs.getString("desc");				
				String drillURI = getDrillDownURI(desc, query, level, max, year, country);
				data[data.length - 2] = drillURI;
				String geoURI = getGeoURI(desc, level, year);
				data[data.length - 1] = geoURI;
				
				
				for(int i = 1; i <= md.getColumnCount(); i++){
					data[i - 1] = rs.getObject(i);
				}
				wr.println(gson.toJson(data));
				
				totalVal += rs.getLong("value");
				
			}
			wr.println("], \"total\": " + totalVal);
			
			rs.close();
			stmt.close();
			
			String postfix = "";
			if(country != -1){
				postfix = "&country="+country;
			}
			else if (request.getParameter("us_state") != null){
				postfix = "&us_state="+request.getParameter("us_state");				
			}
			
			Vector<String> urlHistory = new Vector<String>();
			
			int hs2_rank = offset - 1;

			String hs2Parent = query;
			if(level.equals("4") || level.equals("6")){
				if(level.equals("6"))
					hs2Parent = getHS2Parent(conn, level, query);
				if(hs2Parent == null){
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					return;
				}
				
				hs2_rank = getHS2Rank(conn, year, hs2Parent, country);
			}
			if(hs2_rank < 0){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
				
			int histOffset = 1;
			while(histOffset <= hs2_rank){
				urlHistory.add("ExportProportions?year="+year+
						"&offset="+(histOffset)+
						"&max="+(histOffset+9)+
						"&level=2" 
						+ postfix);
					
				histOffset += 10;
			}
			
			int hs4_rank = -1;
			String hs4Parent = query;
			if(level.equals("6")){
				hs4_rank = getHS4Rank(conn, year, hs4Parent, hs2Parent, country);
			}
			else if(level.equals("4")){
				hs4_rank = offset - 1;
			}
			
			histOffset = 1;
			while(histOffset <= hs4_rank){
				urlHistory.add("ExportProportions?year="+year+
						"&offset="+(histOffset)+
						"&max="+(histOffset+9)+
						"&level=4"
						+"&query=" + URLEncoder.encode(hs2Parent, "UTF-8")
						+ postfix);
					
				histOffset += 10;
			}
			
			if(level.equals("6")){
				histOffset = 1;
				while(histOffset <= offset - 1){
					urlHistory.add("ExportProportions?year="+year+
							"&offset="+(histOffset)+
							"&max="+(histOffset+9)+
							"&level=6"
							+"&query=" + URLEncoder.encode(query, "UTF-8")
							+ postfix);
						
					histOffset += 10;
				}
			}
			
			if(urlHistory.size() > 0){
				wr.println(", \"url_history\": ");
				wr.println(gson.toJson(urlHistory));
			}
			

			wr.print(", \"country\": ");
			if (request.getParameter("us_state") != null){
				wr.println("\"US State: " + request.getParameter("us_state") + "\"");		
			}
			else if(country == -1){
				wr.println("\"Global\"");
			}
			else{
				wr.println("\"" + getCountry(conn, country) + "\"");
			}
			
			wr.println("}");
			
			
			conn.close();
		} catch (NamingException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	private int getHS4Rank(Connection conn, int year, String hs4Parent, String hs2Parent, int country) throws SQLException {
		PreparedStatement stmt;
		ResultSet rs;
		int hs4_rank;
		
		String baseTable = "HS4_PRECOMP";
		if(country != -1){
			baseTable = "(\n " +
					"        SELECT \n " +
					"        CL.HS_4_DESC, \n " +
					"        CL.HS_2_DESC, \n " +
					"        SUM(VALUE) AS VALUE, \n " +
					"        ED.year \n " +
					"        FROM EXPORT_DATA ED, CODE_LOOKUP CL \n " +
					"        WHERE ED.HS_CODE = CL.CODE \n " +
					"        AND GEO = 1 \n " +
					"        AND STATE = 1000 \n " +
					"        AND COUNTRY = ? \n " +
					"        GROUP BY CL.HS_4_DESC, CL.HS_2_DESC, ED.year \n " +
					") \n ";
		}
		
		stmt = conn.prepareStatement(""
				+ "SELECT hs4e.VAL_RANK \n"
				+ "   FROM ( \n"
				+ "        SELECT HS_4_DESC, ROW_NUMBER() OVER (ORDER BY SUM(h4.VALUE) desc) VAL_RANK \n"
				+ "        FROM "+baseTable+" h4 \n"
				+ "        WHERE YEAR = ? \n"
				+ "        AND HS_2_DESC = ? \n"
				+ "        GROUP BY h4.HS_4_DESC \n"
				+ "    ) hs4e \n"
				+ "WHERE hs4e.HS_4_DESC = ?");
		
		int i = 1;
		
		if(country != -1){
			stmt.setInt(i, country);
			i++;
		}
		stmt.setInt(i, year);
		i++;
		stmt.setString(i, hs2Parent);
		i++;
		stmt.setString(i, hs4Parent);
		
		rs = stmt.executeQuery();
		
		if(rs.next())
			hs4_rank = rs.getInt("VAL_RANK");
		else
			hs4_rank = -1;
		rs.close();
		stmt.close();
		return hs4_rank;
	}
	
	private String getCountry(Connection conn, int country) throws SQLException{
		PreparedStatement stmt;
		ResultSet rs;
		String country_label = "";
		stmt = conn.prepareStatement(""
				+ "SELECT max(country_label) as country_label \n"
				+ "   FROM geos \n"
				+ "WHERE country = ?");

		stmt.setInt(1, country);
		
		rs = stmt.executeQuery();
		
		if(rs.next())
			country_label = rs.getString("country_label");
		else
			country_label = "";
		rs.close();
		stmt.close();
		return country_label;
	}
	
	private int getHS2Rank(Connection conn, int year, String hs2Parent, int country) throws SQLException {
		PreparedStatement stmt;
		ResultSet rs;
		int hs2_rank;
		
		String baseTable;
		if(country == -1){
			baseTable = "HS2_PRECOMP";
		}
		else{
			baseTable = "(\n " +
					"        SELECT \n " +
					"        CL.HS_2_DESC, \n " +
					"        SUM(VALUE) AS VALUE, \n " +
					"        ED.year \n " +
					"        FROM EXPORT_DATA ED, CODE_LOOKUP CL \n " +
					"        WHERE ED.HS_CODE = CL.CODE \n " +
					"        AND GEO = 1 \n " +
					"        AND STATE = 1000 \n " +
					"        AND COUNTRY = ? \n " +
					"        GROUP BY CL.HS_2_DESC, ED.year \n " +
					") \n ";
		}
		
		stmt = conn.prepareStatement(""
				+ "SELECT hs2e.VAL_RANK \n"
				+ "   FROM ( \n"
				+ "        SELECT HS_2_DESC, ROW_NUMBER() OVER (ORDER BY SUM(h2.VALUE) desc) VAL_RANK \n"
				+ "        FROM "+ baseTable +" h2 \n"
				+ "        WHERE YEAR = ? \n"
				+ "        GROUP BY h2.HS_2_DESC \n"
				+ "    ) hs2e \n"
				+ "WHERE hs2e.HS_2_DESC = ?");

		
		int i = 1;
		if(country != -1){
			stmt.setInt(i, country);
			i++;
		}
		stmt.setInt(i, year);
		i++;
		stmt.setString(i, hs2Parent);
		
		rs = stmt.executeQuery();
		
		if(rs.next())
			hs2_rank = rs.getInt("VAL_RANK");
		else
			hs2_rank = -1;
		rs.close();
		stmt.close();
		return hs2_rank;
	}

	private String getHS2Parent(Connection conn, String level, String query) throws SQLException {
		PreparedStatement stmt;
		ResultSet rs;
		String hs2Parent;
		String whereField = "";
		whereField = "HS_4_DESC";
			
		stmt = conn.prepareStatement(""
				+ "SELECT HS_2_DESC FROM CODE_LOOKUP WHERE " + whereField + " = ?");
		stmt.setString(1, query);
		rs = stmt.executeQuery();
		if(rs.next()){
			hs2Parent = rs.getString("HS_2_DESC");
		}
		else{
			hs2Parent = null;
		}
		rs.close();
		stmt.close();
		return hs2Parent;
	}


	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
