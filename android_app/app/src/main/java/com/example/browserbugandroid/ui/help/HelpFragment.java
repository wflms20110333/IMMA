package com.example.browserbugandroid.ui.help;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.method.LinkMovementMethod;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.example.browserbugandroid.R;

public class HelpFragment extends Fragment {
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_help, container, false);

        Button bReport = (Button) root.findViewById(R.id.bugreport_button);
        Button fForm = (Button) root.findViewById(R.id.feedback_button);
        Button backButton = (Button) root.findViewById(R.id.help_back_button);
        bReport.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String url = "https://forms.gle/zHE8e4GiZrCb1uMe8";
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(url));
                startActivity(i);
            }
        });
        fForm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String url = "https://forms.gle/k5UnoUqEs8Rq62W47";
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(url));
                startActivity(i);
            }
        });
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                NavController navController = Navigation.findNavController(getActivity(), R.id.nav_host_fragment);
                navController.navigate(R.id.nav_options);
            }
        });

        TextView t1 = (TextView) root.findViewById(R.id.link_social_media);
        t1.setMovementMethod(LinkMovementMethod.getInstance());
        TextView t2 = (TextView) root.findViewById(R.id.link_privacy_policy);
        t2.setMovementMethod(LinkMovementMethod.getInstance());
        TextView t3 = (TextView) root.findViewById(R.id.link_terms_of_use);
        t3.setMovementMethod(LinkMovementMethod.getInstance());

        return root;
    }
}