import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.URL;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {

    static class GetLatestStories implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestURI().getPath().equals("/getTimeStories")) {
                URL url = new URL("https://time.com/");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");

                StringBuilder response = new StringBuilder();
                try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                }

                List<String> extractedData = new ArrayList<>();
                Pattern outerPattern = Pattern.compile("<li class=\"latest-stories__item\">(.*?)<\\/li>",
                        Pattern.DOTALL);
                Matcher outerMatcher = outerPattern.matcher(response.toString());

                while (outerMatcher.find()) {
                    String outerMatch = outerMatcher.group();
                    Pattern innerPattern = Pattern.compile(
                            "<a[^>]*href=\"([^\"]*)\"[^>]*>\\s*<h3[^>]*>(.*?)<\\/h3>\\s*<\\/a>",
                            Pattern.DOTALL);
                    Matcher innerMatcher = innerPattern.matcher(outerMatch);

                    if (innerMatcher.find()) {
                        String href = innerMatcher.group(1);
                        String h3Content = innerMatcher.group(2).trim();
                        extractedData.add("{\"title\":\"" + h3Content + "\", \"link\":\"" + href + "\"}");
                    }
                }

                String jsonResponse = "[" + String.join(",", extractedData) + "]";
                exchange.sendResponseHeaders(200, jsonResponse.length());
                try (OutputStream responseBody = exchange.getResponseBody()) {
                    responseBody.write(jsonResponse.getBytes());
                }
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
        }
    }

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new GetLatestStories());
        server.start();
        System.out.println("Server is running on port: localhost:" + port);
    }
}
