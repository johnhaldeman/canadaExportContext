package com.exportcontext;

import java.io.IOException;
import java.io.PrintWriter;
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
 * Servlet implementation class ExportGeos
 */
@WebServlet("/services/ExportGeos")
public class ExportGeos extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ExportGeos() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json");
		
		String yearStr = request.getParameter("year");
		String territory = request.getParameter("territory");
		String includeUSStr = request.getParameter("include_us");
		String hsLevel = request.getParameter("hs_level");
		String hsCategory = request.getParameter("hs_category");
		boolean includeUS = false;
		
		if(yearStr == null || territory == null || includeUSStr == null){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		
		if(yearStr.matches("[0-9]+") && includeUSStr.matches("true|false")){
			includeUS = includeUSStr.equals("true");
		}
		else{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		
		InitialContext cxt;
		try {
			cxt = new InitialContext();
			DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );
			Connection conn = ds.getConnection();
			
			PrintWriter wr = response.getWriter();
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
			String sql = "";
			
			PreparedStatement stmt;
			stmt = buildStatement(yearStr, territory, includeUS, hsLevel, hsCategory, conn);
			
			ResultSet rs = stmt.executeQuery();
			
			ResultSetMetaData md = rs.getMetaData();
			String[] collHeader = new String[md.getColumnCount()];
			
			for(int i = 1; i <= md.getColumnCount(); i++){
				collHeader[i - 1] = md.getColumnLabel(i);
			}
			wr.println("{\n\"data\": [");
			wr.print(gson.toJson(collHeader));
			
			Vector<Integer> ids = new Vector<Integer>();
						
			long totalVal = 0; 
			while(rs.next()){
				wr.println(",");
				Object[] data = new Object[md.getColumnCount()];
				for(int i = 1; i <= data.length; i++){
					if(rs.getObject(i) == null)
						data[i - 1] = rs.getObject(i);
					else if(rs.getObject(i).getClass() == String.class)
						data[i - 1] = rs.getObject(i).toString().trim();
					else
						data[i - 1] = rs.getObject(i);
				}
				
				totalVal += rs.getLong("value");
				wr.print(gson.toJson(data));
				
				ids.add(rs.getInt("country_id"));
			}
			wr.println("], \n\"total\": " + totalVal );
			stmt.close();
			
			String grandTotalSQL = "select sum(value) as value from geo_world_precomp "
					+ "where year = ?";
			
			stmt = conn.prepareStatement(grandTotalSQL);
			stmt.setString(1, yearStr);
			ResultSet grandTotalResult = stmt.executeQuery();
			grandTotalResult.next();
			wr.println(", \"grand_total\": " + grandTotalResult.getLong("value") );
		
			wr.println(", \"ids\": " + gson.toJson(ids));
			

			wr.println(", \"territory\": " + gson.toJson(territory));
			wr.println(", \"year\": " + gson.toJson(yearStr));
			wr.println(", \"include_us\": " + gson.toJson(includeUSStr));
			wr.println(", \"hs_level\": " + gson.toJson(hsLevel));
			wr.println(", \"hs_category\": " + gson.toJson(hsCategory));
			
			wr.println("}");
			
			rs.close();
			stmt.close();
			conn.close();
		} catch (NamingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private PreparedStatement buildStatement(String yearStr, String territory, boolean includeUS, String hsLevel, String hsCategory, Connection conn)
			throws SQLException {
		String sql;
		PreparedStatement stmt;
		
		if(hsLevel != null && hsCategory != null){
			String levelDesc = "ENGLISH_DESCRIPTION";
			if(hsLevel.equals("2")){
				levelDesc = "HS_2_DESC";
			}
			else if(hsLevel.equals("4")){
				levelDesc = "HS_4_DESC";
			}
			if(territory.equals("World")){
				sql = "SELECT geo.country_code, SUM(ed.VALUE) AS VALUE, country_label, trim(to_char((SUM(ed.VALUE)/1000000), '999,999,999')) || ' million' as value_text, geo.country as country_id" + 
						" FROM EXPORT_DATA ED, geos geo, CODE_LOOKUP CL \n"+
						" WHERE \n"+
						" ED.GEO = 1 \n"+
						" AND ED.COUNTRY = GEO.COUNTRY \n"+
						" AND GEO.STATE IS NULL \n"+
						" AND ED.STATE = 1000 \n"+
						" AND ED.COUNTRY <> 999 \n"+
						" AND ED.HS_CODE = CL.CODE \n"+
						" AND ED.year = ? \n"+
						" AND CL."+levelDesc+" = ? \n"+
						" GROUP BY geo.country_code, geo.country_label, geo.country \n"+
						" ORDER BY VALUE DESC; \n";
				stmt = conn.prepareStatement(sql);
				stmt.setString(2,  hsCategory);
				stmt.setInt(1, Integer.parseInt(yearStr));
			}
			else if(territory.equals("US")){
				sql = "SELECT geo.state_code, SUM(ed.VALUE) AS VALUE, state_label, trim(to_char((SUM(ed.VALUE)/1000000), '999,999,999')) || ' million' as value_text, 0 as country_id" + 
						" FROM EXPORT_DATA ED, geos geo, CODE_LOOKUP CL \n"+
						" WHERE \n"+
						" ED.GEO = 1 \n"+
						" AND ED.COUNTRY = GEO.COUNTRY \n"+
						" AND ED.STATE >= 1002 \n"+
						" AND ED.COUNTRY = 9 \n"+
						" AND ED.STATE = GEO.STATE \n"+
						" and state_code IS NOT NULL \n"+
						" AND ED.HS_CODE = CL.CODE \n"+
						" AND ED.year = ? \n"+
						" AND CL."+levelDesc+" = ? \n"+
						" GROUP BY geo.state_code, geo.state_label \n"+
						" ORDER BY VALUE DESC; \n";
				stmt = conn.prepareStatement(sql);
				stmt.setString(2,  hsCategory);
				stmt.setInt(1, Integer.parseInt(yearStr));
			}
			else{
				sql = "SELECT geo.country_code, SUM(ed.VALUE) AS VALUE, country_label, trim(to_char((SUM(ed.VALUE)/1000000), '999,999,999')) || ' million' as value_text, geo.country as country_id" + 
						" FROM EXPORT_DATA ED, geos geo, CODE_LOOKUP CL \n"+
						" WHERE \n"+
						" ED.GEO = 1 \n"+
						" AND ED.COUNTRY = GEO.COUNTRY \n"+
						" AND GEO.STATE IS NULL \n"+
						" AND ED.STATE = 1000 \n"+
						" AND ED.COUNTRY <> 999 \n"+
						" AND ED.HS_CODE = CL.CODE \n"+
						" AND ED.year = ? \n"+
						" AND CL."+levelDesc+" = ? \n"+
						" AND GEO.territory_text = ? \n" +
						" GROUP BY geo.country_code, geo.country_label, geo.country \n"+
						" ORDER BY VALUE DESC; \n";
				stmt = conn.prepareStatement(sql);
				stmt.setString(3, territory);
				stmt.setString(2,  hsCategory);
				stmt.setInt(1, Integer.parseInt(yearStr));
			}
		}
		else{
			if(territory.equals("World")){
				if(includeUS)
					sql = "select country_code, value, country_label, '$' || trim(to_char((value /1000000), '999,999,999')) || ' million' as value_text, country_id " //, year, territory_text "
							+ "from geo_world_precomp "
							+ "where year = ?";
				else
					sql = "select country_code, value, country_label, '$' || trim(to_char((value /1000000), '999,999,999')) || ' million'  as value_text, country_id " //, year, territory_text "
							+ "from geo_world_precomp "
							+ "where year = ? "
							+ "and country_code <> 'US'";
				stmt = conn.prepareStatement(sql);
				stmt.setString(1, yearStr);
			}
			else if(territory.equals("US")){
				sql = "select state_code, value, state_label, '$' || trim(to_char((value /1000000), '999,999,999')) || ' million'  as value_text, 0 as country_id " //, year, territory_text "
						+ "from geo_us_precomp "
						+ "where year = ?";
				stmt = conn.prepareStatement(sql);
				stmt.setString(1, yearStr);
			}
			else{
				sql = "select country_code, value, country_label, '$' || trim(to_char((value /1000000), '999,999,999')) || ' million'  as value_text, country_id " //, year, territory_text "
						+ "from geo_world_precomp "
						+ "where year = ? "
						+ "and territory_text = ?";
				stmt = conn.prepareStatement(sql);

				stmt.setString(2, territory);
				stmt.setString(1, yearStr);
			}
		}

		return stmt;
	}

}
